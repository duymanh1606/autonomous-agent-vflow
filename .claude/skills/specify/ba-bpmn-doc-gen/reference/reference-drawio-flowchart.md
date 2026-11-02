---
Version: 1.1.0
Author: M2MBA
Last Updated: 2026-04-10
Description: Quy tắc sinh file Draw.io XML (mxGraphModel format) cho quy trình nghiệp vụ dạng Flowchart. Dùng kèm với ba-bpmn-doc-gen SKILL.md khi user chọn output format là Flowchart.
---

# Reference: Sinh Draw.io Flowchart XML (Flowchart Generation Rules v1.1.0)

Tài liệu này mô tả toàn bộ quy tắc kỹ thuật để sinh file Draw.io XML (`.drawio`) từ quy trình nghiệp vụ. Output có thể import trực tiếp vào draw.io web/app.

---

## 1. Điểm khác biệt so với BPMN

| Tiêu chí | BPMN (XML) | Flowchart (Draw.io) |
|----------|------------|---------------------|
| Task thủ công | Icon 🖐️ trong box | Hình thang ngược (inverted trapezoid) |
| Task hệ thống | Icon 👤 trong box | Rectangle bo góc |
| Format | BPMN 2.0 XML | mxGraphModel XML |
| Tool xem | bpmn.io, Camunda, VS Code | draw.io web/app |
| Output file | `.bpmn` | `.drawio` hoặc `.xml` |
| Edges | Có trong XML | **CÓ generate edges** — sinh đầy đủ đường nối |

---

## 2. Cấu trúc XML Draw.io

### 2.1. Root Structure

```xml
<mxGraphModel dx="786" dy="417" grid="1" gridSize="10" guides="1"
              tooltips="1" connect="1" arrows="1" fold="1" page="1"
              pageScale="1" pageWidth="[width]" pageHeight="[height]"
              math="0" shadow="0">
  <root>
    <mxCell id="0" />
    <mxCell id="1" parent="0" />
    <!-- Pool, Lanes, Tasks, Gateways, Events -->
  </root>
</mxGraphModel>
```

> **File giao cho dự án (`.drawio`):** Bọc `<mxfile …>` → `<diagram id="…" name="…">` → `<mxGraphModel>…</mxGraphModel>` → `</diagram></mxfile>` để **File → Open** trên [diagrams.net](https://app.diagrams.net/) hoạt động ổn định. Fragment chỉ có `mxGraphModel` chỉ dùng khi embed nội bộ.

---

### 2.2. Pool — lane dọc theo actor (**MẶC ĐỊNH**)

Mỗi actor một **cột** (vertical swimlane); luồng nghiệp vụ trong lane đi **từ trên xuống** (tăng `y`).

```xml
<mxCell id="pool-1" parent="1"
  style="swimlane;html=1;childLayout=stackLayout;horizontal=1;resizeParent=1;resizeParentMax=0;startSize=30;whiteSpace=wrap;"
  value="[Tên Quy trình]" vertex="1">
  <mxGeometry width="[số_lane × 400]" height="[chiều_cao_pool]" as="geometry" />
</mxCell>
```

- **`horizontal=1`**: các lane con xếp **theo trục X** (cột 0, 400, 800, …) — đây là layout chuẩn skill **ba-bpmn-doc-gen**.
- `width` = `số_lane × 400` (px). `height` = đủ chứa chuỗi task theo **Y** trong lane cao nhất + `startSize` pool + padding (~50px).

---

### 2.3. Lane (cột actor — cùng `height`, tăng `x`)

```xml
<mxCell id="lane-pool-1-1" parent="pool-1"
  style="swimlane;html=1;startSize=25;whiteSpace=wrap;"
  value="[Tên Actor]" vertex="1">
  <mxGeometry x="[lane_index × 400]" y="0" width="400" height="[cùng_height_với_pool_trừ_header]" as="geometry" />
</mxCell>
```

**Tọa độ X tăng dần 400px (lane 1 trái → lane N phải):**
```
Lane 1: x=0,    width=400
Lane 2: x=400,  width=400
Lane 3: x=800,  width=400
Lane 4: x=1200, width=400
```

**KHÔNG** đặt nhiều bước tuần tự cùng lane bằng cách tăng `x` (trái–phải). Trong **một** lane, bước nối tiếp dùng **cùng `x` gần giữa lane (~120–150)** và **tăng `y`** (khoảng cách gợi ý xem §3.2).

---

### 2.3b. Pool — lane ngang (**chỉ khi user yêu cầu**)

Nếu stakeholder muốn mỗi actor một **dải ngang** (luồng chính trái–phải trong từng hàng):

- Pool: `horizontal=0` (và thường `width` lớn theo chiều ngang, mỗi lane một **hàng** `height` cố định ~180–220px).
- Lane: `y = lane_index × height_row`, `width` = gần full pool width.

**Mặc định skill không dùng** biến thể này — tránh nhầm với layout lane dọc §2.2.

---

### 2.4. Start Event

```xml
<mxCell id="start-1" parent="lane-pool-1-1"
  style="strokeWidth=2;html=1;shape=mxgraph.flowchart.start_1;whiteSpace=wrap;"
  value="Start" vertex="1">
  <mxGeometry height="60" width="100" x="150" y="60" as="geometry" />
</mxCell>
```

- **Label**: Chỉ hiển thị `"Start"` — KHÔNG có số thứ tự, KHÔNG có tên bước.
- **Vị trí**: `y = 50–80px` (sát đầu lane), `x = ~150px` (căn giữa lane 400px).
- Nối tới **Task 1** (bước đầu tiên trong quy trình).

---

### 2.5. Task — Thủ công (Inverted Trapezoid)

Dùng cho các bước **không qua hệ thống** (ký giấy, kiểm tra vật lý, gặp mặt...).

```xml
<mxCell id="task-1" parent="lane-pool-1-1"
  style="verticalLabelPosition=middle;verticalAlign=middle;html=1;shape=trapezoid;
         perimeter=trapezoidPerimeter;whiteSpace=wrap;size=0.23;arcSize=10;
         flipV=1;labelPosition=center;align=center;fontStyle=1;fontSize=14;"
  value="1. [Tên task]" vertex="1">
  <mxGeometry x="120" y="[y]" width="160" height="110" as="geometry" />
</mxCell>
```

**Key styles:**
- `shape=trapezoid` + `flipV=1` → Hình thang ngược ▽
- `fontStyle=1;fontSize=14` → Chữ đậm, cỡ 14

---

### 2.6. Task — Hệ thống (Rectangle)

Dùng cho **User Task** (user thao tác trên hệ thống) và **Service Task** (hệ thống tự động).

```xml
<mxCell id="task-2" parent="lane-pool-1-1"
  style="rounded=1;whiteSpace=wrap;html=1;fontStyle=1;fontSize=14;"
  value="2. [Tên task]" vertex="1">
  <mxGeometry x="120" y="[y]" width="160" height="110" as="geometry" />
</mxCell>
```

**Key styles:**
- `rounded=1` → Rectangle bo góc
- `fontStyle=1;fontSize=14` → Chữ đậm, cỡ 14
- Nền mặc định trắng — KHÔNG thêm `fillColor`.

---

### 2.7. Gateway (Decision Node)

```xml
<mxCell id="gateway-1" parent="lane-pool-1-1"
  style="strokeWidth=2;html=1;shape=mxgraph.flowchart.decision;whiteSpace=wrap;"
  value="[Câu hỏi quyết định?]" vertex="1">
  <mxGeometry x="[x]" y="[y]" width="100" height="100" as="geometry" />
</mxCell>
```

**Khi nào cần Gateway:**
- ✅ Cần: Điều kiện phức tạp, người đọc cần được làm rõ (phê duyệt, kiểm tra điều kiện, v.v.)
- ❌ Không cần: Luồng hiển nhiên, người đọc tự hiểu

**Bắt buộc**: Generate đủ TẤT CẢ các nhánh từ Gateway (Yes/No, Đồng ý/Từ chối...).

---

### 2.8. End Event

```xml
<mxCell id="end-1" parent="lane-pool-1-1"
  style="strokeWidth=2;html=1;shape=mxgraph.flowchart.start_1;whiteSpace=wrap;"
  value="End" vertex="1">
  <mxGeometry height="60" width="100" x="150" y="[task_cuoi_y + 200]" as="geometry" />
</mxCell>
```

- **Label**: Chỉ hiển thị `"End"` — KHÔNG có số thứ tự.
- **Vị trí**: `y = task cuối + 200px`.
- Nhận kết nối từ Task cuối cùng.

---

### 2.9. Edges (Sequence Flow)

> ⚠️ **BẮT BUỘC generate edges trong XML.**
> Cần nối đầy đủ các node với nhau bằng Sequence Flows. Sử dụng `edgeStyle=orthogonalEdgeStyle` để đường đi vuông góc và gọn gàng, hạn chế đè lên elements khác.

Cấu trúc edge cơ bản:
```xml
<!-- Nối thông thường -->
<mxCell id="edge-task1-task2" edge="1" parent="pool-1"
  source="task-1" target="task-2"
  style="edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=block;html=1;">
  <mxGeometry relative="1" as="geometry" />
</mxCell>

<!-- Nối rẽ nhánh từ Gateway (có label & bẻ góc) -->
<mxCell id="edge-gateway1-task3" edge="1" parent="pool-1"
  source="gateway-1" target="task-3"
  style="edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=block;html=1;exitX=1;exitY=0.5;entryX=0;entryY=0.5;"
  value="Có">
  <mxGeometry relative="1" as="geometry">
    <Array as="points">
      <mxPoint x="750" y="650" />
      <mxPoint x="750" y="1255" />
    </Array>
  </mxGeometry>
</mxCell>
```

---

## 3. Quy tắc Layout & Positioning

### 3.1. Sizing tổng quan

| Element | Width | Height |
|---------|-------|--------|
| Pool | N lanes × 400px | lane cao nhất + ~50px |
| Lane | 400px (cố định) | đủ chứa tasks + padding |
| Task (thủ công / hệ thống) | 160px | 110px |
| Gateway | 100px | 100px |
| Start / End Event | 100px | 60px |

### 3.2. Spacing theo trục Y — **luồng mặc định trong lane dọc**

Khi pool dùng **`horizontal=1`** (§2.2), **mọi bước tuần tự trong cùng một lane** xếp theo **Y tăng dần**, `x` gần cố định (căn giữa cột 400px). Không xếp chuỗi bước cùng actor bằng cách dịch `x` sang phải.

```
y ≈ 50   → Start Event
y ≈ 150  → Task 1
y ≈ 300  → Task 2 (+ ~150px)
y ≈ 450  → Task 3
…
y cuối   → End Event (sau task cuối + khoảng trống ~140–200px)
```

**Công thức linh hoạt:**
- `Task_Y(k) ≈ Task_Y(k-1) + 140–170` (task cao 110px + khe).
- `Lane_Height` / `pool height` ≥ `y_task_cuối + 110 + 140 + 60 (End) + padding`.

**Ngoại lệ:** layout lane **ngang** (`horizontal=0`, §2.3b) thì trong mỗi **hàng** lane có thể tăng `x` trái–phải; không áp dụng quy tắc “chỉ tăng Y” cho cả sơ đồ.

### 3.3. Spacing theo trục X (vị trí cột lane)

```
Lane 1: x=0
Lane 2: x=400
Lane 3: x=800
Lane N: x=(N-1)×400
```

### 3.4. Positioning X trong lane (cột 400px)

- Task 160px rộng: `x ≈ 120` (căn giữa). Task rộng hơn (vd. 180px): `x ≈ 110`.
- Start/End 100px: `x ≈ 150`.
- Gateway 100px: `x ≈ 150`.

### 3.5. Thuật toán chống chồng chéo Cross-Lane (Anti-Overlap Rule)

> 🚨 **Bắt buộc áp dụng** khi một flow đi từ một lane, **bỏ qua** lane trung gian, và kết nối đến lane khác.

#### Vấn đề
Với **lane dọc** (cột actor, §2.2), khi edge nối `Lane A → Lane C` (bỏ qua **lane B ở giữa** theo trục X), đường nối đi **ngang** qua vùng lane B. Nếu lane B có task **cùng khoảng Y** với đoạn nối, cạnh dễ **đè** lên shape.

#### Quy tắc đặt Y-position

| Tình huống | Hành động |
|------------|-----------|
| Task nguồn ở Lane A, task đích ở Lane C, edge đi qua Lane B | Kiểm tra xem Lane B có task ở Y-range tương tự không |
| Lane B **CÓ task** ở cùng Y-row với task nguồn/đích | Task đích **PHẢI** được đặt ở Y-row MỚI (Y + 200px) |
| Lane B **KHÔNG có task** ở cùng Y-row | Task đích có thể giữ nguyên Y-row |
| Edge thẳng đứng xuyên qua nhiều lane có tasks | Dùng waypoint "hành lang" offset ±20–30px so với center-x |

#### Ví dụ thực tế

```
❌ SAI – Task 5 (Lane BQL, y=200), Task 6 (Lane CuDan, y=200), Task 7 (Lane BaoVe, y=200)
  → Edge T5→T6 đi thẳng đứng tại center-x của Lane BQL
  → Edge T6→T7 đi thẳng đứng xuyên qua Lane BQL tại y=200, ĐÈ lên Task 5!

✅ ĐÚNG – Tách Task 7 sang Y-row mới:
  Task 5 (Lane BQL): y=200    ← Y-row A
  Task 6 (Lane CuDan): y=200  ← cùng Y-row A (T5→T6 edge đi ngang, OK)
  Task 7 (Lane BaoVe): y=400  ← Y-row B (KHÁC Y-row A → edge T6→T7 né Task 5)
```

#### Thuật toán kiểm tra trước khi sinh XML

```
FOR mỗi task_đích cần cross 2+ lanes:
  intermediate_lanes = get_lanes_between(task_nguon.lane, task_dich.lane)
  FOR mỗi lane_giua trong intermediate_lanes:
    Nếu TỒN TẠI task trong lane_giua ở cùng Y-row:
      → task_đích.Y = task_nguon.Y + 200   // lùi xuống 1 row
      → Dùng waypoint offset (x ± 20px) để routing né shapes
    ELSE:
      → task_đích có thể giữ nguyên Y-row với task_nguon
```

#### Waypoint routing khi cần lệch

```xml
<!-- Edge từ Lane CuDan (x_col=0) → Lane BaoVe (x_col=800), qua Lane BQL (x_col=400) -->
<!-- Dùng waypoint đi lệch x+20px so với center lane BQL để tránh shape ở center -->
<mxCell id="edge-t6-t7" edge="1" parent="pool-1"
  source="task-6" target="task-7"
  style="edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=block;html=1;">
  <mxGeometry relative="1" as="geometry">
    <Array as="points">
      <mxPoint x="220" y="315" />   <!-- routing qua hành lang x=220 (offset +20 khỏi center=200) -->
      <mxPoint x="220" y="455" />
    </Array>
  </mxGeometry>
</mxCell>
```

---

### 3.6. Edges giữa các lane (layout lane dọc — mặc định)

`parent` của edge = `pool-1`. Dùng `edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=block;html=1;`.

| Tình huống | Gợi ý `exit` / `entry` |
|------------|-------------------------|
| Bước sau **cùng lane**, ở **phía dưới** | `exitX=0.5;exitY=1` → `entryX=0.5;entryY=0` |
| Từ lane trái sang lane **kế bên phải** (cùng mức Y) | `exitX=1;exitY=0.5` → `entryX=0;entryY=0.5` |
| Từ lane phải **quay về** lane trái | `exitX=0;exitY=0.5` → `entryX=1;entryY=0.5` |
| Gateway xuống End **cùng lane** | `exitX=0.5;exitY=1` → `entryX=0.5;entryY=0` |
| Gateway sang task **lane bên phải** | `exitX=1;exitY=0.5` → `entryX=0;entryY=0.5` |

Nếu orthogonal tự routing xấu, thêm `<Array as="points">` với `mxPoint` (xem §3.5 waypoint).

---

## 4. ID Naming Convention

| Element | Format | Ví dụ |
|---------|--------|-------|
| Pool | `pool-[index]` | `pool-1` |
| Lane | `lane-pool-[pool-id]-[lane-index]` | `lane-pool-1-1` |
| Start Event | `start-[index]` | `start-1` |
| Task | `task-[step-number]` | `task-1`, `task-2` |
| Gateway | `gateway-[index]` | `gateway-1` |
| End Event | `end-[index]` | `end-1`, `end-2` |

---

## 5. Quy tắc Đặt tên Task

- ✅ **BẮT BUỘC** có số thứ tự: `"1. [Tên]"`, `"2. [Tên]"`, ...
- ✅ Số thứ tự **khớp** với số thứ tự trong Bảng Xác Nhận (Phase 1).
- ✅ **KHÔNG** lặp tên lane trong tên task:
  - ❌ `"2. Kế toán kiểm tra hoá đơn"` (lane đã là "Kế toán")
  - ✅ `"2. Kiểm tra hoá đơn"`

---

## 6. Escape XML trong Value

| Ký tự | Escape |
|-------|--------|
| `&` | `&amp;` |
| `<` | `&lt;` |
| `>` | `&gt;` |
| `"` | `&quot;` |
| `'` | `&apos;` |

---

## 7. Page Dimensions

```python
pageWidth  = pool_width  + 200   # padding mỗi bên
pageHeight = pool_height + 200
```

---

## 8. Output File

- **Tên file**: `ba-bpmn-doc-[tên_quy_trình]-flowchart.drawio`
- **Thư mục**: `Processes/`
- **Lưu ý**: Mở bằng [draw.io](https://app.diagrams.net/) — File > Import từ device, chọn file `.drawio`.

---

## 9. Ví dụ Output hoàn chỉnh (Mini)

> Hai lane **cột** (`x=0` và `x=400`), task trong lane 1 xếp **theo Y** (200 → 400). File thật cần **đủ edges** (§2.9) + bọc `mxfile` (§2.1).

```xml
<mxGraphModel dx="786" dy="417" grid="1" gridSize="10" guides="1"
              tooltips="1" connect="1" arrows="1" fold="1" page="1"
              pageScale="1" pageWidth="1800" pageHeight="1100" math="0" shadow="0">
  <root>
    <mxCell id="0" />
    <mxCell id="1" parent="0" />

    <!-- Pool -->
    <mxCell id="pool-1" parent="1"
      style="swimlane;html=1;childLayout=stackLayout;horizontal=1;resizeParent=1;resizeParentMax=0;startSize=30;whiteSpace=wrap;"
      value="Quy trình Mua hàng" vertex="1">
      <mxGeometry width="1600" height="930" as="geometry" />
    </mxCell>

    <!-- Lane 1: Nhân viên Thu mua -->
    <mxCell id="lane-pool-1-1" parent="pool-1"
      style="swimlane;html=1;startSize=25;whiteSpace=wrap;"
      value="Nhân viên Thu mua" vertex="1">
      <mxGeometry x="0" y="0" width="400" height="930" as="geometry" />
    </mxCell>

    <!-- Start Event -->
    <mxCell id="start-1" parent="lane-pool-1-1"
      style="strokeWidth=2;html=1;shape=mxgraph.flowchart.start_1;whiteSpace=wrap;"
      value="Start" vertex="1">
      <mxGeometry height="60" width="100" x="150" y="60" as="geometry" />
    </mxCell>

    <!-- Task 1: Thủ công → Trapezoid -->
    <mxCell id="task-1" parent="lane-pool-1-1"
      style="verticalLabelPosition=middle;verticalAlign=middle;html=1;shape=trapezoid;perimeter=trapezoidPerimeter;whiteSpace=wrap;size=0.23;arcSize=10;flipV=1;labelPosition=center;align=center;fontStyle=1;fontSize=14;"
      value="1. Xác định nhu cầu mua hàng" vertex="1">
      <mxGeometry x="120" y="200" width="160" height="110" as="geometry" />
    </mxCell>

    <!-- Task 2: Hệ thống → Rectangle -->
    <mxCell id="task-2" parent="lane-pool-1-1"
      style="rounded=1;whiteSpace=wrap;html=1;fontStyle=1;fontSize=14;"
      value="2. Lập Phiếu Yêu cầu mua hàng" vertex="1">
      <mxGeometry x="120" y="400" width="160" height="110" as="geometry" />
    </mxCell>

    <!-- Lane 2: Trưởng phòng -->
    <mxCell id="lane-pool-1-2" parent="pool-1"
      style="swimlane;html=1;startSize=25;whiteSpace=wrap;"
      value="Trưởng phòng" vertex="1">
      <mxGeometry x="400" y="0" width="400" height="930" as="geometry" />
    </mxCell>

    <!-- Gateway -->
    <mxCell id="gateway-1" parent="lane-pool-1-2"
      style="strokeWidth=2;html=1;shape=mxgraph.flowchart.decision;whiteSpace=wrap;"
      value="Phê duyệt yêu cầu?" vertex="1">
      <mxGeometry x="150" y="200" width="100" height="100" as="geometry" />
    </mxCell>

    <!-- End Event: Từ chối -->
    <mxCell id="end-1" parent="lane-pool-1-2"
      style="strokeWidth=2;html=1;shape=mxgraph.flowchart.start_1;whiteSpace=wrap;"
      value="End" vertex="1">
      <mxGeometry height="60" width="100" x="150" y="400" as="geometry" />
    </mxCell>
  </root>
</mxGraphModel>
```

---

> Version: 1.1.0 | Author: M2MBA | Last Updated: 2026-04-10
> Reference cho skill: ba-bpmn-doc-gen (dùng khi output = Flowchart Draw.io)
