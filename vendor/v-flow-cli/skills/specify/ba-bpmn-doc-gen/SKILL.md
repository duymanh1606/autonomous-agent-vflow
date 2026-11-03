---
name: ba-bpmn-doc-gen
description: "Skill chuyên nghiệp tạo sơ đồ quy trình nghiệp vụ, hỗ trợ hai định dạng output: BPMN Mermaid (Markdown) và Flowchart Draw.io XML."
---

# HƯỚNG DẪN SKILL: BA BPMN DOC GEN

**Version:** 1.3.2
**Author:** M2MBA
**Last Updated:** 2026-04-10
**Description:** Skill chuyên nghiệp tạo sơ đồ quy trình nghiệp vụ, hỗ trợ hai định dạng output: BPMN Mermaid (Markdown) và Flowchart Draw.io XML. Chỉ tập trung vẽ sơ đồ trực quan, không mô tả chi tiết.

## 🎯 Mục đích
Skill chuyên dùng để chuyển đổi các mô tả quy trình thô (văn bản hoặc hình ảnh) thành sơ đồ quy trình chuyên nghiệp. Output RẤT TẬP TRUNG vào việc sinh ra biểu diễn trực quan (Mermaid hoặc Draw.io XML), TUYỆT ĐỐI KHÔNG sinh bảng mô tả, không giải thích dài dòng.

**✨ Features:**
- ✅ **Dual Format Output**: Hỗ trợ BPMN Mermaid (Markdown) hoặc Flowchart Draw.io XML.
- ✅ **Task Numbering**: Tự động đánh số "[STT]. [Tên]" cho mọi node.
- ✅ **Confirmation Workflow**: Phân tích và xác nhận cấu trúc trước khi sinh file.
- ✅ **Tối giản hóa thông minh**: Đề xuất gộp các bước quá chi tiết để quy trình gọn gọn.
- ✅ **Multiple End Events**: Mỗi nhánh có kết thúc riêng, tránh rối luồng.
- ✅ **Swimlanes Layout**: Tự động phân tách Lane theo Actor.

---

## 📋 Quy trình thực hiện (4 Phases)

### 🎛️ PHASE 0: CHỌN FORMAT OUTPUT

**DỪNG LẠI** và hỏi user ngay khi nhận yêu cầu:

> 🖼️ Bạn muốn tạo sơ đồ theo dạng nào?
> - **[A] BPMN**: Hiển thị trực tiếp trong Markdown, phù hợp với VS Code, GitHub.
> - **[B] Flowchart Draw.io**: File `.drawio` import vào draw.io, hình thang ngược cho task thủ công.

**Lưu kết quả lựa chọn** vào biến `OUTPUT_FORMAT`:
- Nếu chọn A hoặc "BPMN"  → `OUTPUT_FORMAT = "BPMN"`
- Nếu chọn B hoặc "draw.io" hoặc "flowchart" → `OUTPUT_FORMAT = "DRAWIO"`

---

### 📝 PHASE 1: ANALYZE & CONFIRM

#### 1.1. Phân tích Input
- **Actors/Lanes**: Xác định ai thực hiện (Nhân viên, Hệ thống, Kế toán...).
- **Tasks**: Động từ + Danh từ. Bắt buộc format: `[STT]. [Tên task]`.
- **Gateways**: Điểm quyết định (Nếu/Thì).
- **Phân loại**:
  - **Thủ công (Manual)** 🖐️: Không qua hệ thống (ký giấy, kiểm tra vật lý).
  - **Hệ thống (System/User)** 👤: Thao tác trên phần mềm hoặc hệ thống tự động.

#### 1.2. Tạo Bảng Xác Nhận (Confirmation Table)
Show bảng này cho user review:
| Bước | Tên | Lane | Loại Notation | Ghi chú |
|------|-----|------|---------------|---------|
| 1 | 1. Kiểm tra giấy tờ | Nhân viên | Manual Task 🖐️ | ... |

#### 1.3. Quy tắc Tối Giản Hóa
- **Rule 1**: Gộp các bước tuần tự đơn giản (mở file, kiểm tra nhỏ) thành 1 task lớn.
- **Rule 2**: Gộp các bước setup/chuẩn bị.
- **Rule 3**: KHÔNG gộp các điểm quyết định, phê duyệt hoặc handoff giữa các actor.

---

### 👤 PHASE 2: USER INTERACTION
- **DỪNG LẠI** và chờ User xác nhận Table ở Phase 1.
- Nếu User yêu cầu sửa, cập nhật lại Table cho đến khi được duyệt ("OK", "Generate").

---

### 🎨 PHASE 3: GENERATE DOCUMENTATION

#### 3.1. Phân nhánh theo OUTPUT_FORMAT

**Nếu `OUTPUT_FORMAT = "BPMN"`** → Xem `reference-bpmn-generation.md`:
- Sinh `flowchart LR` Mermaid với `subgraph` cho từng Lane.
- Quy ước: `((Start/End))`, `[Task]`, `{Gateway}`.
- Xuất file `.md` chỉ chứa duy nhất code block Sơ đồ Mermaid (không có bảng mô tả).

**Nếu `OUTPUT_FORMAT = "DRAWIO"`** → Xem `reference-drawio-flowchart.md`:
- **Lane dọc (mặc định — swimlane theo cột actor):** Pool dùng `childLayout=stackLayout` + **`horizontal=1`**. Mỗi lane: `width=400`, `x = lane_index × 400`, `y=0`, **cùng `height`** = chiều cao pool. **Luồng tuần tự trong một lane đi theo trục Y** (Start → Task → … → End), **không** xếp nối tiếp các bước cùng lane theo trục X.
- **Tránh nhầm:** `horizontal=0` trên pool → các lane thành **dải ngang** (Học viên / Hệ thống / … chồng theo hàng), luồng chính đi trái–phải — **chỉ dùng khi user/stakeholder yêu cầu rõ** dạng đó.
- Task thủ công 🖐️ → hình thang ngược (`flipV=1`). Task hệ thống 👤⚙️ → rectangle bo góc.
- **BẮT BUỘC** `edges` nối đủ node; cạnh **giữa hai lane kề** dùng `exitX` / `entryX` (trái–phải) hoặc `exitY` / `entryY` (trên–dưới) như bảng trong reference §3.6.
- File `.drawio` giao cho dự án: bọc `<mxfile>` → `<diagram>` → `<mxGraphModel>` (để mở trực tiếp bằng diagrams.net).

#### 3.2. Cấu trúc file output
- Chỉ bao gồm nội dung sơ đồ (code Mermaid hoặc thẻ XML của Draw.io).
- TUYỆT ĐỐI KHÔNG xuất văn bản giới thiệu, bảng mô tả các bước hay bất kỳ text nào ngoài lề.

---

## 🛠 Nguyên tắc thiết kế (Best Practices)
- **Compact Layout**: Spacing vừa phải, không để diagram quá dài.
- **Multiple End Events**: Mỗi nhánh rẽ thất bại/hoàn thành nên có Node End riêng.
- **Naming**: Luôn dùng [Động từ] + [Danh từ] cho Task.

## 📂 Danh mục Reference & Scripts
- [reference-bpmn-generation.md](file:///e:/Training%20Project/Skill%20BA%20gg%20Antigravity/.agent/skills/ba-bpmn-doc-gen/reference/reference-bpmn-generation.md): Quy tắc chi tiết về layout, mapping và cấu trúc BPMN XML/Mermaid.
- [reference-drawio-flowchart.md](file:///e:/Training%20Project/Skill%20BA%20gg%20Antigravity/.agent/skills/ba-bpmn-doc-gen/reference/reference-drawio-flowchart.md): Quy tắc sinh Draw.io XML (mxGraphModel), shapes, layout và naming convention.

## 📂 Output File
- Thư mục: `docs-BA/Processes/` (tạo nếu chưa có).
- **BPMN format**: `ba-bpmn-doc-[tên_quy_trình].md` (chỉ chứa block code Mermaid).
- **Draw.io format**: `ba-bpmn-doc-[tên_quy_trình]-flowchart.drawio`

---

