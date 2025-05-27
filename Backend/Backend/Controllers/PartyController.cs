using Backend.DTO;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using static System.Net.WebRequestMethods;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/party")]
    public class PartyController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public PartyController(IConfiguration configuration, AppDbContext context)
        {
            _configuration = configuration;
            _context = context;
        }

        [Authorize]
        [HttpPost("createParty")]
        public async Task<ActionResult> CreateParty()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var party = new Party
            {
                user_id = Int32.Parse(userId),
                active = true
            };

            await _context.Party.AddAsync(party);
            await _context.SaveChangesAsync();

            var newParty = await _context.Party.OrderBy(p => p.Id).LastOrDefaultAsync(p => p.user_id == Int32.Parse(userId));

            var partyMember = new Party_Member
            {
                party_id = newParty.Id,
                user_id = int.Parse(userId),
                accepted = true,
                invited = true,
                role = "driver"
            };
            await _context.Party_Members.AddAsync(partyMember);
            await _context.SaveChangesAsync();
            return Ok(newParty);
        }
        [Authorize]
        [HttpPost("addPartyMember")]
        public async Task<ActionResult> AddPartyMember([FromBody] PartyMemberDTO partyMemberDTO)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var partyMember = new Party_Member
            {
                party_id = partyMemberDTO.party_id,
                user_id = partyMemberDTO.user_id,
                accepted = false,
                invited = true,
                role = "passenger"
            };

            await _context.Party_Members.AddAsync(partyMember);
            await _context.SaveChangesAsync();

            return Ok("Party created successfully.");
        }
        [Authorize]
        [HttpGet("getUserParties")]
        public async Task<IActionResult> GetUserParties()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            int parsedUserId = int.Parse(userId);

            // Get all parties created by the user
            var parties = await _context.Party
                .Where(p => p.user_id == parsedUserId)
                .ToListAsync();


            if (!parties.Any())
            {
                return Ok(new List<PartyDTO>()); // Better than returning NotFound
            }

            var partyDTOs = new List<PartyDTO>();

            foreach (var party in parties)
            {
                var partyDto = new PartyDTO
                {
                    party_id = party.Id,
                    driver_name = await GetUserName(party.user_id),
                    user_id = party.user_id,
                    colleague_list = new List<PartyColleagueDTO>()
                };

                // Manually fetch party members for this party
                var members = await _context.Party_Members
                    .Where(pm => pm.party_id == party.Id && pm.accepted)
                    .ToListAsync();

                var userAddress = await _context.UserAddresses.FirstOrDefaultAsync(a => a.user_id == int.Parse(userId));
                if (userAddress == null || userAddress.work_lat == null || userAddress.work_lon == null)
                {
                    return NotFound("User address or coordinates not found");
                }
                if (userAddress.work_lat == null || userAddress.work_lon == null ||
        userAddress.work_lat < -90 || userAddress.work_lat > 90 ||
        userAddress.work_lon < -180 || userAddress.work_lon > 180)
                {
                    return BadRequest("Invalid user coordinates");
                }
                foreach (var member in members)
                {
                    // Skip the driver if you only want to include colleagues
                    if (member.user_id == parsedUserId)
                        continue;

                    var user = await _context.Users.FindAsync(member.user_id);
                    if (user == null) continue;

                    var userAddresses = await _context.UserAddresses
                        .FirstOrDefaultAsync(ua => ua.user_id == user.Id);

                    partyDto.colleague_list.Add(new PartyColleagueDTO
                    {
                        user_id = user.Id,
                        user_name = user.Username,
                        work_address = userAddresses.work_address,
                        home_address = userAddresses.home_address,
                        work_coordinates = new CoordinatesDto
                        {
                            latitude = userAddresses.work_lat,
                            longitude = userAddresses.work_lon
                        },
                        home_coordinates = new CoordinatesDto
                        {
                            latitude = userAddresses.home_lat,
                            longitude = userAddresses.home_lon
                        },
                        image_path = user.ImagePath,
                        distance = await GetDistance(userAddress.home_lat, userAddress.home_lon, userAddresses.home_lat, userAddresses.home_lon)
                    });
                }

                partyDTOs.Add(partyDto);
            }

            return Ok(partyDTOs);
        }


        [Authorize]
        [HttpGet("getPassengerParties")]
        public async Task<IActionResult> GetPassengerParties()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            int parsedUserId = int.Parse(userId);

            // Get all parties where the user is a passenger
            var parties = await _context.Party_Members
                .Where(pm => pm.user_id == parsedUserId && pm.role == "passenger" && pm.accepted)
                .Select(pm => pm.party_id)
                .ToListAsync();

            if (!parties.Any())
            {
                return Ok(new List<PartyDTO>()); // Better than returning NotFound
            }

            var partyDTOs = new List<PartyDTO>();

            foreach (var partyId in parties)
            {
                var party = await _context.Party.FindAsync(partyId);
                if (party == null) continue;

                var partyDto = new PartyDTO
                {
                    party_id = party.Id,
                    driver_name = await GetUserName(party.user_id),
                    user_id = party.user_id,
                    colleague_list = new List<PartyColleagueDTO>()
                };

                // Manually fetch party members for this party
                var members = await _context.Party_Members
                    .Where(pm => pm.party_id == party.Id && pm.accepted)
                    .ToListAsync();

                foreach (var member in members)
                {
                    // Skip the user if you only want to include colleagues
                    if (member.user_id == parsedUserId)
                        continue;

                    var user = await _context.Users.FindAsync(member.user_id);
                    if (user == null) continue;

                    var userAddresses = await _context.UserAddresses
                        .FirstOrDefaultAsync(ua => ua.user_id == user.Id);

                    partyDto.colleague_list.Add(new PartyColleagueDTO
                    {
                        user_id = user.Id,
                        user_name = user.Username,
                        work_address = userAddresses.work_address,
                        home_address = userAddresses.home_address,
                        work_coordinates = new CoordinatesDto
                        {
                            latitude = userAddresses.work_lat,
                            longitude = userAddresses.work_lon
                        },
                        home_coordinates = new CoordinatesDto
                        {
                            latitude = userAddresses.home_lat,
                            longitude = userAddresses.home_lon
                        },
                        image_path = user.ImagePath,
                    });
                }

                partyDTOs.Add(partyDto);
            }

            return Ok(partyDTOs);
        }

        [Authorize]
        [HttpDelete("leaveParty/{id}")]
        public async Task<IActionResult> LeaveParty(int id)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var partyMember = await _context.Party_Members
                .FirstOrDefaultAsync(pm => pm.party_id == id && pm.user_id == int.Parse(userId));

            if (partyMember == null)
            {
                return NotFound("Party member not found.");
            }

            if (partyMember.role == "driver")
            {
                return BadRequest("Driver cannot leave the party.");
            }

            _context.Party_Members.Remove(partyMember);
            await _context.SaveChangesAsync();

            return Ok("Left the party successfully.");
        }

        [Authorize]
        [HttpDelete("deleteParty/{id}")]
        public async Task<IActionResult> DeleteParty(int id)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var party = await _context.Party.FindAsync(id);
            if (party == null || party.user_id != int.Parse(userId))
            {
                return NotFound("Party not found or you are not the owner.");
            }

            //remove party members
            var partyMembers = await _context.Party_Members
                .Where(pm => pm.party_id == id)
                .ToListAsync();
            _context.Party_Members.RemoveRange(partyMembers);
            await _context.SaveChangesAsync();

            _context.Party.Remove(party);
            await _context.SaveChangesAsync();

            return Ok("Party deleted successfully.");
        }


        [Authorize]
        [HttpGet("getInvites")]
        public async Task<IActionResult> GetInvites()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            int parsedUserId = int.Parse(userId);

            var invites = await _context.Party_Members
                .Where(pm => pm.user_id == parsedUserId && pm.invited && !pm.accepted)
                .Include(pm => pm.party)
                .ToListAsync();

            var response = new List<object>();

            foreach (var invite in invites)
            {
                var driver = await _context.Users.FindAsync(invite.party.user_id);
                response.Add(new
                {
                    party_id = invite.party_id,
                    driver_name = driver?.Username,
                    driver_id = driver?.Id,
                });
            }

            return Ok(response);
        }

        [Authorize]
        [HttpPost("respondToInvite")]
        public async Task<IActionResult> RespondToInvite([FromBody] Party_Member responseDto)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            int parsedUserId = int.Parse(userId);

            var invite = await _context.Party_Members
                .FirstOrDefaultAsync(pm => pm.party_id == responseDto.party_id && pm.user_id == parsedUserId && pm.invited && !pm.accepted);

            if (invite == null)
            {
                return NotFound("Invite not found.");
            }

            if (responseDto.accepted)
            {
                invite.accepted = true;
                await _context.SaveChangesAsync();
                return Ok("Invite accepted.");
            }
            else
            {
                _context.Party_Members.Remove(invite);
                await _context.SaveChangesAsync();
                return Ok("Invite declined.");
            }
        }

        [Authorize]
        [HttpGet("getPartyRecommendations")]
        public async Task<IActionResult> GetPartyRecommendations()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var user = await _context.Users
                .Where(u => u.Id == int.Parse(userId))
                .FirstOrDefaultAsync();
            Console.WriteLine($"User ID: {userId}");
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var userAddress = await _context.UserAddresses.FirstOrDefaultAsync(a => a.user_id == int.Parse(userId));
            if (userAddress == null || userAddress.work_lat == null || userAddress.work_lon == null)
            {
                return NotFound("User address or coordinates not found");
            }
            if (userAddress.work_lat == null || userAddress.work_lon == null ||
    userAddress.work_lat < -90 || userAddress.work_lat > 90 ||
    userAddress.work_lon < -180 || userAddress.work_lon > 180)
            {
                return BadRequest("Invalid user coordinates");
            }


            var colleagues = await _context.UserAddresses.Where(a => a.user_id != int.Parse(userId) &&
                a.work_address == userAddress.work_address &&
                a.work_lat != null &&
                a.work_lon != null &&
                a.work_lat >= -90 && a.work_lat <= 90 &&
                a.work_lon >= -180 && a.work_lon <= 180)
                .ToListAsync();

            if (colleagues == null || colleagues.Count == 0)
            {
                return NotFound("No colleagues found with the same work address and valid coordinates");
            }
            var filteredColleagues = new List<UserAddress>();

            foreach (var colleague in colleagues)
            {
                var preference = await _context.User_Preferences.FirstOrDefaultAsync(a => a.user_id == int.Parse(userId) && a.other_user_id == colleague.user_id);
                if (preference == null || preference.liked != false)
                {
                    filteredColleagues.Add(colleague);
                }
            }

            if (filteredColleagues == null || filteredColleagues.Count == 0)
            {
                filteredColleagues = colleagues;
            }

            // Build coordinates string
            var coordinates = $"{userAddress.home_lon},{userAddress.home_lat}";
            foreach (var colleague in filteredColleagues)
            {
                coordinates += $";{colleague.home_lon},{colleague.home_lat}";
            }

            var accessToken = _configuration["Mapbox:AccessToken"];
            var url = $"https://api.mapbox.com/directions-matrix/v1/mapbox/driving/{coordinates}?access_token={accessToken}&annotations=distance&sources=0";
            Console.WriteLine("Mapbox request URL: " + url); // or use ILogger

            using var httpClient = new HttpClient();
            var response = await httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var jsonString = await response.Content.ReadAsStringAsync();
            using var jsonDoc = JsonDocument.Parse(jsonString);
            var root = jsonDoc.RootElement;

            var distances = root.GetProperty("distances")[0];
            var result = new List<PartyColleagueDTO>();
            for (int i = 0; i < filteredColleagues.Count; i++)
            {

                var c = filteredColleagues[i];
                var userA = await _context.Users.FindAsync(c.user_id);
                if (distances[i + 1].GetDouble() < 50000)
                {
                    result.Add(new PartyColleagueDTO
                    {
                        user_id = c.user_id,
                        user_name = userA?.Username ?? "Unknown",
                        work_address = c.work_address,
                        home_address = c.home_address,
                        work_coordinates = new CoordinatesDto
                        {
                            latitude = c.work_lat,
                            longitude = c.work_lon
                        },
                        home_coordinates = new CoordinatesDto
                        {
                            latitude = c.home_lat,
                            longitude = c.home_lon
                        },
                        distance = distances[i + 1].GetDouble(),
                        image_path = user?.ImagePath
                    });
                }
            }
            if (result.Count == 0 || result == null)
            {
                return NotFound("No colleagues found in the given range");
            }

            var userWorkTimes = await _context.User_Work_Times
                .Where(uwt => uwt.user_id == user.Id)
                .ToListAsync();
            if (userWorkTimes == null || userWorkTimes.Count == 0)
            {
                return NotFound("No work times found for the user");
            }

            var colleagueIds = result.Select(c => c.user_id).ToList();
            var colleagueWorkTimes = await _context.User_Work_Times
                .Where(uwt => colleagueIds.Contains(uwt.user_id))
                .ToListAsync();
            if (colleagueWorkTimes == null || colleagueWorkTimes.Count == 0)
            {
                return NotFound("No colleagues found with work times");
            }

            var matchingColleagues = result
                .Where(colleague => colleagueWorkTimes.Any(cwt =>
                    cwt.user_id == colleague.user_id &&
                    userWorkTimes.Any(uwt =>
                        Math.Abs((uwt.start_time - cwt.start_time).TotalMinutes) < 5)))
                .ToList();

            if (matchingColleagues == null || matchingColleagues.Count == 0)
            {
                return NotFound("No colleagues found with matching work times");
            }
            return Ok(matchingColleagues);
        }
        [HttpPost("getDistance")]
        public async Task<double> GetDistance(double lat1, double lon1, double lat2, double lon2)
        {
            var coordinates = $"{lon1},{lat1}";
            coordinates += $";{lon2},{lat2}";

            var accessToken = _configuration["Mapbox:AccessToken"];
            var url = $"https://api.mapbox.com/directions-matrix/v1/mapbox/driving/{coordinates}?access_token={accessToken}&annotations=distance&sources=0";
            Console.WriteLine("Mapbox request URL: " + url); // or use ILogger

            using var httpClient = new HttpClient();
            var response = await httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var jsonString = await response.Content.ReadAsStringAsync();
            using var jsonDoc = JsonDocument.Parse(jsonString);
            var root = jsonDoc.RootElement;

            var distances = root.GetProperty("distances")[0];
            return distances[1].ValueKind == JsonValueKind.Number
                ? distances[1].GetDouble()
                : 0;
        }

        private async Task<string> GetUserName(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            return user?.Username ?? "Unknown";
        }
    }
}
