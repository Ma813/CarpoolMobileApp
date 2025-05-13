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


        private async Task<string> GetUserName(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            return user?.Username ?? "Unknown";
        }
    }
}
