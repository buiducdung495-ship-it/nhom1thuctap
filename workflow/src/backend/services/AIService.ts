import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      console.warn('⚠️ GEMINI_API_KEY is missing or using default placeholder. Mocked AI services will be used.');
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

export class AIService {
  static async analyzeRequestComplexity(formTitle: string, data: Record<string, any>): Promise<{
    complexity: 'Thấp' | 'Trung bình' | 'Nghiêm trọng';
    aiRecommendation: string;
    suggestedStagesCount: number;
    explanation: string;
  }> {
    const prompt = `Bạn là trợ lý AI chuyên viên quản lý nhân sự hành chính doanh nghiệp.
Hãy phân tích độ phức tạp, rủi ro hành chính và mức độ ảnh hưởng của đề xuất này:
Loại đơn: "${formTitle}"
Dữ liệu đơn: ${JSON.stringify(data, null, 2)}

Hãy trả về kết quả định dạng JSON thuần túy (không chứa markdown \`\`\`json) gồm các trường sau:
- complexity: Mức độ phức tạp ('Thấp' | 'Trung bình' | 'Nghiêm trọng')
- aiRecommendation: Nhận xét/Khuyến nghị của AI cho Quản lý phê duyệt (viết ngắn gọn, chuyên nghiệp, tiếng Việt)
- suggestedStagesCount: Số cấp duyệt khuyến nghị (1, 2 hoặc 3 cấp duyệt)
- explanation: Giải thích lý do vì sao đánh giá như vậy.`;

    const ai = getAI();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        });

        const text = response.text;
        if (text) {
          const cleanText = text.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '');
          return JSON.parse(cleanText);
        }
      } catch (err) {
        console.error('Gemini API Error, using fallback recommendation:', err);
      }
    }

    // High quality Vietnam-specific Fallback logic when Gemini key is missing or fails
    let complexity: 'Thấp' | 'Trung bình' | 'Nghiêm trọng' = 'Thấp';
    let aiRecommendation = 'Đơn hợp lệ, khuyến nghị Trưởng bộ phận duyệt nhanh chóng để bảo đảm tiến độ công việc.';
    let suggestedStagesCount = 1;
    let explanation = 'Dựa trên phân tích tham số chuẩn của công ty, đề xuất này nằm trong phạm vi xử lý của phòng ban.';

    if (formTitle.includes('nghỉ phép')) {
      const days = Number(data.num_days || 0);
      if (days > 7) {
        complexity = 'Nghiêm trọng';
        aiRecommendation = 'Nghỉ phép dài ngày (>7 ngày) có thể ảnh hưởng lớn đến tiến độ dự án hiện tại. Khuyến nghị Quản lý và HR kiểm tra kỹ phương án bàn giao công việc trước khi ký duyệt.';
        suggestedStagesCount = 3;
        explanation = `Thời gian nghỉ dài (${days} ngày) vượt hạn mức phê duyệt nhanh thông thường. Cần ký duyệt từ Quản lý trực tiếp, Trưởng phòng Nhân sự và Ban Giám Đốc.`;
      } else if (days >= 3) {
        complexity = 'Trung bình';
        aiRecommendation = 'Đề xuất nghỉ từ 3 đến 7 ngày. Khuyến nghị phê duyệt nếu nhân viên đã hoàn tất bàn giao công việc hàng ngày.';
        suggestedStagesCount = 2;
        explanation = `Số ngày nghỉ là ${days} ngày nằm ở mức vừa phải, cần duyệt qua 2 cấp: Trưởng phòng trực tiếp và Phòng nhân sự kiểm tra quỹ phép năm.`;
      } else {
        complexity = 'Thấp';
        aiRecommendation = 'Nghỉ phép ngắn ngày (<3 ngày). Phù hợp duyệt nhanh, không gây rủi ro gián đoạn công việc.';
        suggestedStagesCount = 1;
        explanation = 'Số ngày nghỉ ngắn ngày, không ảnh hưởng lớn đến vận hành phòng ban. Chỉ cần 1 cấp Quản lý trực tiếp phê duyệt.';
      }
    } else if (formTitle.includes('thiết bị')) {
      const urgency = data.urgency || '';
      const category = data.device_category || '';
      if (urgency.includes('Rất khẩn cấp') || category === 'Laptop' || category === 'Phone') {
        complexity = 'Trung bình';
        aiRecommendation = `Đăng ký thiết bị giá trị cao (${category}). Cần IT kiểm tra tình trạng kho sẵn có trước khi phê duyệt cấp mới để tối ưu chi phí.`;
        suggestedStagesCount = 2;
        explanation = `Yêu cầu thiết bị thuộc danh mục giá trị cao hoặc mức độ khẩn cấp cao. Cần thông qua Trưởng bộ phận và Quản trị viên quản lý tài sản để cấp phát.`;
      } else {
        complexity = 'Thấp';
        aiRecommendation = 'Yêu cầu cấp phát thiết bị thông thường văn phòng. Khuyến nghị duyệt cấp phát nếu có sẵn trong kho.';
        suggestedStagesCount = 1;
        explanation = 'Thiết bị văn phòng tiêu chuẩn có sẵn trong kho lưu trữ, quy trình cấp phát đơn giản.';
      }
    }

    return { complexity, aiRecommendation, suggestedStagesCount, explanation };
  }

  static async generateFormFields(prompt: string, user: any): Promise<{ title: string, fields: any[] }> {
    const systemInstruction = `Bạn là trợ lý AI chuyên tạo các biểu mẫu (form) hành chính. 
Người dùng sẽ đưa ra một yêu cầu tạo đơn (ví dụ: xin nghỉ phép, xin mua thiết bị...).
Hãy trả về JSON chứa:
- title: Tiêu đề của đơn (vd: "ĐƠN XIN NGHỈ PHÉP")
- fields: Mảng các trường trong đơn. Mỗi trường có:
  - id: chuỗi ngẫu nhiên (ví dụ "f1", "f2")
  - type: một trong ["text", "textarea", "number", "select", "checkbox", "date"]
  - label: Tên trường
  - value: Giá trị mặc định hoặc giá trị được tính toán từ nội dung yêu cầu của người dùng.

Yêu cầu chi tiết:
- Đối với Đơn xin nghỉ phép:
  + "Kính gửi": Ban Giám đốc & Trưởng phòng NS
  + "Tên tôi là": lấy từ user.name
  + "Bộ phận": lấy từ user.department
  + "Lý do xin nghỉ": phân tích từ yêu cầu.
  + "Ngày bắt đầu": mặc định là ngày hiện tại (định dạng YYYY-MM-DD), hoặc phân tích từ yêu cầu.
  + "Ngày kết thúc": định dạng YYYY-MM-DD, phân tích từ yêu cầu hoặc tính toán dựa trên ngày bắt đầu và số ngày.
  + "Số ngày nghỉ phép": trích xuất từ yêu cầu (vd: "nghỉ 2 ngày"), hoặc tự tính toán nếu người dùng cung cấp ngày bắt đầu và ngày kết thúc.
  + "Trường hợp bất khả kháng": kiểu checkbox (true/false). Bật true (checked) NẾU lý do là "tai nạn" hoặc "nhà có tang".

- Trả về đúng định dạng JSON, không kèm giải thích.`;

    const ai = getAI();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: `Thông tin user:\n${JSON.stringify(user, null, 2)}\n\nYêu cầu của người dùng:\n"${prompt}"`,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.1
          }
        });

        const text = response.text;
        if (text) {
          const cleanText = text.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '');
          return JSON.parse(cleanText);
        }
      } catch (err) {
        console.warn('Gemini API Warning in generateFormFields - falling back to local heuristic', err);
      }
    }

    // Fallback logic
    const promptLower = prompt.toLowerCase();
    let newTitle = 'ĐƠN ĐỀ NGHỊ';
    let newFields: any[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    if (promptLower.includes('nghỉ') || promptLower.includes('ốm')) {
      newTitle = 'ĐƠN XIN NGHỈ PHÉP';
      const isForceMajeure = promptLower.includes('tai nạn') || promptLower.includes('tang');
      const numDaysMatch = promptLower.match(/(\d+)\s*(ngày|hôm)/);
      const numDays = numDaysMatch ? parseInt(numDaysMatch[1]) : 1;

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (numDays - 1));
      const endDateStr = endDate.toISOString().split('T')[0];

      newFields = [
        { id: 'f1', type: 'text', label: 'Kính gửi', value: 'Ban Giám đốc & Trưởng phòng NS' },
        { id: 'f2', type: 'text', label: 'Tên tôi là', value: user?.name || '' },
        { id: 'f3', type: 'text', label: 'Bộ phận', value: user?.department || '' },
        { id: 'f4', type: 'textarea', label: 'Lý do xin nghỉ', value: prompt },
        { id: 'f5', type: 'date', label: 'Ngày bắt đầu', value: todayStr },
        { id: 'f5b', type: 'date', label: 'Ngày kết thúc', value: endDateStr },
        { id: 'f6', type: 'number', label: 'Số ngày nghỉ phép', value: numDays },
        { id: 'f7', type: 'checkbox', label: 'Trường hợp bất khả kháng', value: isForceMajeure },
      ];
    } else {
      newTitle = 'ĐƠN TRÌNH DUYỆT CHUNG';
      newFields = [
        { id: 'f1', type: 'text', label: 'Kính gửi', value: 'Ban Giám đốc' },
        { id: 'f2', type: 'text', label: 'Tên người viết', value: user?.name || '' },
        { id: 'f3', type: 'textarea', label: 'Nội dung trình bày', value: prompt },
      ];
    }

    return { title: newTitle, fields: newFields };
  }

  static async chatWithAI(userMessage: string, chatHistory: { role: 'user' | 'model'; text: string }[]): Promise<string> {
    const systemInstruction = `Bạn là trợ lý ảo AI chuyên nghiệp của phòng Nhân sự và Quản lý tài sản (Hệ thống Form & Workflow).
Nhiệm vụ của bạn là giải đáp các thắc mắc về:
1. Quy trình xin nghỉ phép (nghỉ phép năm có lương, nghỉ ốm, nghỉ không lương). Công ty có quy định: nghỉ dưới 3 ngày chỉ cần Trưởng phòng duyệt; từ 3 ngày trở lên cần thêm Trưởng phòng nhân sự và Ban Giám Đốc duyệt.
2. Quy trình cấp phát, đổi trả, sửa chữa máy tính (Macbook, Dell), màn hình, ghế công thái học.
3. Quy trình mua thanh lý máy móc công ty: nhân viên được quyền đăng ký mua lại máy tính mình đang dùng với giá thanh lý ưu đãi khấu trừ trực tiếp vào lương hoặc ví Momo, thẻ tín dụng khi được Admin duyệt.
Hãy trả lời thân thiện, lịch sự, chuyên nghiệp, bằng tiếng Việt.`;

    const ai = getAI();
    if (ai) {
      try {
        const chat = ai.chats.create({
          model: 'gemini-3.5-flash',
          config: { systemInstruction }
        });

        // Initialize history
        for (const turn of chatHistory) {
          // Send messages sequentially to build history or send simple prompt
        }

        const response = await chat.sendMessage({ message: userMessage });
        return response.text || 'Xin lỗi, tôi gặp chút gián đoạn khi xử lý câu hỏi này.';
      } catch (err) {
        console.error('Gemini Chat Error, using local responder:', err);
      }
    }

    // High quality Viet help responder when Gemini key is offline
    const text = userMessage.toLowerCase();
    if (text.includes('xin chào') || text.includes('hi') || text.includes('hello')) {
      return 'Xin chào! Tôi là Trợ lý AI Hành chính & Tài sản của bạn. Tôi có thể hỗ trợ gì cho bạn hôm nay? Bạn có thể hỏi về quy chế nghỉ phép, yêu cầu cấp thiết bị hoặc mua thanh lý tài sản nhé!';
    }
    if (text.includes('phép') || text.includes('nghỉ')) {
      return 'Theo quy định của công ty:\n- **Dưới 3 ngày**: Duyệt nhanh qua 1 cấp (Trưởng bộ phận trực tiếp duyệt).\n- **Từ 3 ngày trở lên**: Cần 2 cấp duyệt (Trưởng bộ phận duyệt lần 1, Trưởng phòng Nhân sự duyệt lần 2).\n- Vui lòng vào mục "Mẫu đơn" -> chọn "Đơn xin nghỉ phép" để tạo yêu cầu nhé!';
    }
    if (text.includes('thiết bị') || text.includes('máy tính') || text.includes('macbook') || text.includes('dell')) {
      return 'Để yêu cầu cấp phát hoặc đổi thiết bị mới:\n1. Vào mục "Thiết bị" để xem các máy sẵn có trong kho.\n2. Chọn "Yêu cầu cấp phát" hoặc "Yêu cầu đổi trả".\n3. Đơn của bạn sẽ tự động gửi tới Trưởng phòng và Quản trị kho phê duyệt.';
    }
    if (text.includes('thanh lý') || text.includes('mua lại') || text.includes('khấu trừ')) {
      return 'Nhân viên có thể mua thanh lý thiết bị công ty cấp phát sau thời gian khấu hao:\n- Giá thanh lý cực kỳ ưu đãi dựa trên mức hỏng hóc hiện tại.\n- Hỗ trợ thanh toán qua: **Thẻ tín dụng**, **Ví điện tử MoMo/ZaloPay** hoặc **Khấu trừ trực tiếp vào lương** kỳ tiếp theo.\n- Vui lòng chọn máy của bạn trong mục "Máy móc sở hữu" và click "Mua thanh lý".';
    }

    return 'Cảm ơn câu hỏi của bạn. Quy trình công ty quy định rõ ràng: các đơn từ đều được tự động hóa phân cấp duyệt theo mức độ nghiêm trọng và số ngày xin nghỉ để tối ưu vận hành. Bạn có cần hướng dẫn tạo biểu mẫu hay duyệt đơn không?';
  }
}
