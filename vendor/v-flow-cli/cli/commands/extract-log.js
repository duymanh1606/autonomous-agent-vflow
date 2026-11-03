const fs = require('fs');
const readline = require('readline');
const path = require('path');

function extractUserRequest(content) {
  const match = content.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
  return match ? match[1].trim() : content.trim();
}

function getLatestConversationId(brainPath) {
  if (!fs.existsSync(brainPath)) return null;
  const dirs = fs.readdirSync(brainPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => {
      const dirPath = path.join(brainPath, dirent.name);
      return { name: dirent.name, time: fs.statSync(dirPath).mtime.getTime() };
    })
    .sort((a, b) => b.time - a.time);
  return dirs.length > 0 ? dirs[0].name : null;
}

async function parseTranscript(transcriptPath, outputPath, conversationId) {
  if (!fs.existsSync(transcriptPath)) {
    console.error("❌ Không tìm thấy file transcript tại:", transcriptPath);
    return;
  }

  const fileStream = fs.createReadStream(transcriptPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const workingMem = [];
  let currentSession = null;

  for await (const line of rl) {
    if (!line.trim()) continue;
    const entry = JSON.parse(line);

    // 1. Nhận diện User Prompt
    if (entry.type === 'USER_INPUT' && entry.content) {
      if (currentSession) {
        workingMem.push(currentSession);
      }
      
      currentSession = {
        conversation_id: conversationId,
        timestamp: entry.created_at,
        user_prompt: extractUserRequest(entry.content),
        ai_response: "",
        tools_used: [],
        estimated_tokens: 0 
      };
      
      currentSession.estimated_tokens += Math.round(entry.content.split(/\s+/).length * 1.3);
    }

    // 2. Nhận diện Tool Calls & Trả lời từ AI
    if (entry.type === 'PLANNER_RESPONSE' && currentSession) {
      if (entry.content) {
        currentSession.ai_response += (currentSession.ai_response ? "\n" : "") + entry.content;
      }
      if (entry.tool_calls && entry.tool_calls.length > 0) {
        for (const tool of entry.tool_calls) {
          currentSession.tools_used.push(`${tool.name}: ${tool.args.toolSummary || tool.args.CommandLine || ''}`);
        }
      }
      
      const textLen = (entry.thinking ? entry.thinking.split(/\s+/).length : 0) + (entry.content ? entry.content.split(/\s+/).length : 0);
      currentSession.estimated_tokens += Math.round(textLen * 1.3);
    }
  }

  if (currentSession) {
    workingMem.push(currentSession);
  }

  let existingData = [];
  if (fs.existsSync(outputPath)) {
    try {
      existingData = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
      if (!Array.isArray(existingData)) existingData = [];
    } catch (e) {
      existingData = [];
    }
  }

  // Xóa các record cũ của chính conversationId này để ghi đè bản mới nhất của phiên hiện tại
  existingData = existingData.filter(item => item.conversation_id !== conversationId);
  
  // Nối dữ liệu mới vào
  const mergedData = existingData.concat(workingMem);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(mergedData, null, 2), 'utf-8');
  console.log(`✅ Đã đồng bộ thành công ${workingMem.length} luồng chat vào: ${outputPath} (Tổng cộng: ${mergedData.length} records)`);
}

module.exports = function(program) {
  program
    .command('extract-log')
    .description('Trích xuất log hội thoại (Working Memory) từ file ẩn của Antigravity')
    .action(async () => {
      const userHome = process.env.USERPROFILE || process.env.HOME;
      const brainPath = path.join(userHome, `.gemini/antigravity/brain/`);
      
      let CONVERSATION_ID = getLatestConversationId(brainPath);
      
      if (!CONVERSATION_ID) {
        console.error("❌ Không tìm thấy Conversation ID nào trong thư mục brain của Antigravity.");
        process.exit(1);
      }
      
      const transcriptPath = path.join(brainPath, CONVERSATION_ID, `.system_generated/logs/transcript_full.jsonl`);
      const outputPath = path.join(process.cwd(), '.v-flow/logs/working_mem_from_system.json');
      
      await parseTranscript(transcriptPath, outputPath, CONVERSATION_ID);
    });
};
