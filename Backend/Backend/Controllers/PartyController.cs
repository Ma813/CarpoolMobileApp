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
                role = "passenger"
            };

            await _context.Party_Members.AddAsync(partyMember);
            await _context.SaveChangesAsync();

            return Ok("Party created successfully.");
        }
    }
}
