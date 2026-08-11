# คำถาม–คำตอบเกี่ยวกับเว็บ Ultra SAMOOD (Mood of the Major)

เอกสารนี้รวบรวมคำถามและคำตอบสำหรับนำเสนอ / สอบถามเกี่ยวกับโปรเจกต์  
**Live:** [saig-project.vercel.app](https://saig-project.vercel.app)

---

## 1. ความรู้ทั่วไป

### Q1: เว็บนี้ชื่ออะไร และทำอะไร?
**A:** ชื่อแบรนด์ใน UI คือ **Ultra SAMOOD** (repo เรียก Mood of the Major) เป็นกระดานปักโน้ตอารมณ์แบบไม่ระบุตัวตนสำหรับนักศึกษา KMITL — เข้าสู่ระบบด้วย KMITL SSO แล้วแปะโน้ตสั้นๆ ว่าวันนี้รู้สึกอย่างไร โดยไม่เปิดเผยชื่อจริงหรือรหัสนักศึกษาบนกระดาน

### Q2: ทำไมต้องมีเว็บแบบนี้?
**A:** นักศึกษาต้องการพื้นที่ระบายความรู้สึกในแคมปัสโดยไม่ต้องกลัวถูกจับตัวตน ในขณะที่ยังรู้บริบทว่าคนโพสต์มาจากคณะ/สาขา/ชั้นปีไหน จึงเห็น “บรรยากาศ” ของมหาวิทยาลัยได้โดยไม่เสียความเป็นส่วนตัว

### Q3: ใครใช้ได้บ้าง?
**A:** เฉพาะนักศึกษาที่มีบัญชี KMITL (ต้องยืนยันตัวตนผ่าน KMITL SSO) — ไม่มีระบบสมัครด้วยรหัสผ่านเอง

### Q4: บนกระดานเห็นข้อมูลอะไรของคนโพสต์?
**A:** เห็นเฉพาะ **นามแฝง (alias)**, **คณะ**, **สาขา**, และ **ชั้นปี** — ไม่แสดงชื่อจริง, รหัสนักศึกษา, หรืออีเมล

### Q5: มีมู้ดอะไรบ้าง?
**A:** เช่น มีความสุข, ชิล, ง่วง, เครียด, เศร้า, ตื่นเต้น, โมโห, ง่วงนอน, หิว, หนาว, ร้อน, ไม่สบาย — แต่ละมู้ดมีสีโน้ตต่างกัน

### Q6: นอกจากกระดานยังมีหน้าอะไร?
**A:**
- **กระดาน** (`/`) — feed โน้ต + กรอง/ค้นหา/แบ่งหน้า
- **มู้ดโดยรวม / Campus Vibe** (`/stats`) — สถิติการกระจายมู้ดและแยกตามคณะ
- **จัดการโน้ต** (`/admin`) — แอดมินลบโน้ตไม่เหมาะสม
- **เข้าสู่ระบบ / สมัคร** (`/login`, `/register`) — ผ่าน KMITL SSO

### Q7: โปรเจกต์นี้เป็นของใคร?
**A:** เป็นโปรเจกต์นักศึกษา (Private student project — Saig-Project)

---

## 2. ความรู้เกี่ยวกับเว็บ (Web fundamentals)

### Q8: Frontend กับ Backend ต่างกันอย่างไร?
**A:**
- **Frontend** = ส่วนที่ผู้ใช้เห็นและโต้ตอบ (React SPA บน Vercel)
- **Backend** = API ที่จัดการข้อมูล ความปลอดภัย และธุรกิจ (Express บน Render)
- ทั้งสองคุยกันผ่าน HTTP/JSON โดย frontend เรียก API ตาม `VITE_API_URL`

### Q9: SPA คืออะไร? เว็บนี้เป็น SPA ไหม?
**A:** SPA (Single Page Application) โหลดหน้าเดียวแล้วเปลี่ยนหน้าด้วย client-side routing โดยไม่รีโหลดทั้งไซต์ — เว็บนี้เป็น SPA ด้วย React Router (`/`, `/stats`, `/admin` ฯลฯ)

### Q10: REST API คืออะไร? ในโปรเจกต์มี endpoint หลักอะไร?
**A:** REST API คือรูปแบบออกแบบ API ตามทรัพยากรและ HTTP method  
ตัวอย่างในโปรเจกต์:
- `/api/health` — ตรวจว่าเซิร์ฟเวอร์ยังทำงาน
- `/api/auth/*` — ล็อกอิน / สมัคร / refresh / logout (KMITL OIDC)
- `/api/moods/*` — สร้าง อ่าน แก้ ลบโน้ต
- `/api/stats/*` — สถิติมู้ด
- `/api-docs` — Swagger UI (นอก production)

### Q11: CORS คืออะไร? ทำไมสำคัญกับเว็บนี้?
**A:** CORS จำกัดว่าเบราว์เซอร์อนุญาตให้ frontend จาก origin ใดเรียก API ได้  
เว็บนี้แยกโดเมน (Vercel ≠ Render) จึงต้องตั้ง `CLIENT_URL` ให้ตรง origin ของ frontend และตั้ง cookie/CORS ให้ถูกต้อง โดยเฉพาะโหมด production ที่ใช้ cookie ข้ามโดเมน

### Q12: Cookie กับ JWT ใช้ทำอะไรในการยืนยันตัวตน?
**A:**
- **Access JWT** (~15 นาที) เก็บใน memory ฝั่ง client — ใช้เรียก API
- **Refresh token** (7 วัน) อยู่ใน **httpOnly cookie** path `/api/auth` — JavaScript อ่านตรงๆ ไม่ได้ ช่วยลดความเสี่ยง XSS ขโมย refresh token และมีการหมุน (rotate) เมื่อ refresh

### Q13: httpOnly cookie ต่างจาก localStorage อย่างไร?
**A:** ค่าใน `localStorage` ถูกอ่านด้วย JS ได้ (เสี่ยง XSS) ส่วน cookie ที่ตั้ง `httpOnly` เบราว์เซอร์ส่งให้เซิร์ฟเวอร์เองแต่สคริปต์หน้าเว็บอ่านไม่ได้ — โปรเจกต์จึงเก็บ refresh token แบบ httpOnly

### Q14: OIDC / SSO คืออะไร?
**A:** SSO (Single Sign-On) ให้ล็อกอินที่หนึ่งที่แล้วใช้หลายระบบได้  
OIDC (OpenID Connect) เป็นมาตรฐานยืนยันตัวตนบน OAuth 2.0 — โปรเจกต์ใช้ **KMITL OIDC** เพื่อยืนยันว่าผู้ใช้เป็นนักศึกษาจริง โดยไม่เก็บรหัสผ่านในแอป

### Q15: Database ของเว็บนี้คืออะไร? ทำไมเลือกแบบนี้?
**A:** **MongoDB** (เอกสาร JSON-like) ผ่าน Mongoose  
เหมาะกับข้อมูลที่โครงสร้างยืดหยุ่น เช่น โน้ตมู้ด + โปรไฟล์ผู้ใช้ และ deploy ได้ง่ายทั้ง Docker ในเครื่องและ MongoDB Atlas บน cloud

### Q16: การ deploy แยก frontend / backend มีข้อดีอะไร?
**A:** แยก scale และ lifecycle ได้ — SPA บน Vercel (CDN/static) ส่วน API บน Render ที่ต้องการ runtime Node และเชื่อม MongoDB Atlas ทำให้ต้นทุนและ workflow ของแต่ละชั้นชัดเจน

---

## 3. ความรู้ที่ใช้ทำเว็บเรา (Stack & การออกแบบระบบ)

### Q17: Stack ที่ใช้มีอะไรบ้าง?
**A:**

| ชั้น | เทคโนโลยี |
|------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, Framer Motion |
| Backend | Express 4, Mongoose 8 (CommonJS) |
| Database | MongoDB 7 (Docker ท้องถิ่น) / Atlas (production) |
| Auth | KMITL OIDC + JWT |
| Production | Vercel (client) + Render (API) + MongoDB Atlas |

### Q18: ทำไมเลือก React + Vite + TypeScript?
**A:**
- **React** — component และ state ที่เหมาะกับ UI กระดาน/โมดอล/ฟอร์ม
- **Vite** — dev server เร็ว build ทันสมัย
- **TypeScript** — ลดบั๊กชนิดข้อมูล (มู้ด, user, API response) และช่วย refactor ปลอดภัยขึ้น

### Q19: ฟอร์มและ validation ทำอย่างไร?
**A:** ฝั่ง client ใช้ **react-hook-form + Zod** (`@hookform/resolvers`)  
ฝั่ง server ใช้ **express-validator** และ schema ของ Mongoose (เช่นข้อความโน้ตยาวได้สูงสุด 280 ตัวอักษร)

### Q20: ความเป็นส่วนตัวออกแบบอย่างไรในโค้ด?
**A:**
1. โมเดล `Mood` เก็บ `author` (ObjectId) ไว้ใน DB แต่ **ไม่ส่งออก** ใน API
2. ใช้ `toPublicJSON()` ส่งเฉพาะ alias / faculty / major / year + สิทธิ์เช่น `isOwner`, `canEdit`, `canDelete`
3. ข้อมูลคณะ/สาขา/ปีถูก **denormalize** ตอนโพสต์ — ประวัติโน้ตคงที่แม้โปรไฟล์เปลี่ยนภายหลัง และไม่เก็บชื่อ/รหัสบนเอกสารมู้ด

### Q21: นามแฝง (alias) มาจากไหน?
**A:** สร้าง/จัดการฝั่ง server (`aliasService`) เพื่อให้แสดงตัวตนบนกระดานโดยไม่ผูกกับชื่อจริง

### Q22: UI กระดาน “โพสต์อิท” ทำให้ดูไม่เรียบเหมือนการ์ดกริดได้อย่างไร?
**A:** ใช้ค่าที่คำนวณจาก `id` แบบ deterministic (hash) เช่น มุมเอียง (`rotation`), offset แนวตั้ง/แนวนอน, และความสูง short/medium/tall — layout นิ่งเมื่อโหลดซ้ำ ไม่กระตุกสุ่มทุกครั้ง

### Q23: มีมาตรการความปลอดภัยอะไรบ้างฝั่ง API?
**A:** ตัวอย่างที่ใช้ในโปรเจกต์:
- **Helmet**, **HPP**, **express-mongo-sanitize**
- **Rate limit**
- **Same-origin** check สำหรับบางคำขอ
- CORS จำกัดตาม `CLIENT_URL`
- ไม่เก็บรหัสผ่านผู้ใช้ (SSO only)
- แยก access / refresh token + httpOnly cookie

### Q24: i18n ทำอย่างไร?
**A:** มีข้อความแยกไฟล์ `th.ts` / `en.ts` และสลับภาษาด้วย `LocaleContext` + `LanguageSwitch` — ภาษาไทยเขียนเป็นภาษผลิตภัณฑ์โดยตรง ไม่ใช่แปลตรงจากอังกฤษทีละประโยค

### Q25: Admin ทำงานอย่างไร?
**A:** ผู้ใช้ที่มี `role: admin` (seed ด้วย `npm run seed:admin` จากรหัส/อีเมลที่กำหนด) เข้า `/admin` ได้ และลบโน้ตใดก็ได้ — การลบกู้คืนไม่ได้ ส่วนเจ้าของโน้ตทั่วไปแก้/ลบได้เฉพาะของตัวเอง

### Q26: โครงสร้างโฟลเดอร์หลักเป็นอย่างไร?
**A:**
```text
client/   → React SPA (Vite)
server/   → Express API
docker-compose.yml → MongoDB ท้องถิ่น
render.yaml → blueprint deploy API
DEPLOY.md → คู่มือ production
```

### Q27: รันพัฒนาท้องถิ่นต้องทำอะไร?
**A:**
1. `npm run install:all`
2. คัดลอก `.env` จากตัวอย่างของ client/server
3. `npm run docker:up` เปิด MongoDB
4. (ครั้งแรก) `cd server && npm run seed:admin`
5. `npm run dev:server` + `npm run dev:client`  
Client ≈ `localhost:5173`, API ≈ `localhost:4000`

---

## 4. การต่อยอดเว็บจากตอนนี้

### Q28: ต่อยอดด้านผลิตภัณฑ์ (Product) ได้อะไรบ้าง?
**A:** แนวทางที่สอดคล้องกับระบบปัจจุบัน:
1. **ปฏิกิริยาบนโน้ต** — เช่น ใจ/กำลังใจ โดยไม่เปิดเผยตัวตนผู้กด
2. **แท็กหัวข้อ** — midterm, หอพัก, โปรเจกต์ เพื่อกรองนอกเหนือจากมู้ด/คณะ
3. **สรุปรายวัน/รายสัปดาห์** — “มู้ดประจำวันของ KMITL” จาก `/stats`
4. **โหมดระบายแบบจำกัดเวลา** — โน้ตหมดอายุอัตโนมัติ (TTL) เพื่อความเป็นส่วนตัวยิ่งขึ้น
5. **รายงานโน้ต** — ผู้ใช้ทั่วไป report แล้วแอดมินตรวจในคิว

### Q29: ต่อยอดด้าน UX/UI ได้อย่างไร?
**A:**
- Dark/light ที่เข้ากับธีมกระดาน (ระวังไม่ทำลายบรรยากาศ corkboard)
- Skeleton loading / optimistic UI ตอนแปะโน้ต
- Infinite scroll หรือ virtualized list แทน pagination เมื่อโน้ตเยอะ
- Accessibility: focus trap ในโมดอล, contrast ของสีมู้ด, screen reader labels

### Q30: ต่อยอดด้านเทคนิค / สถาปัตยกรรม?
**A:**
1. **Realtime** — WebSocket หรือ SSE ให้กระดานอัปเดตเมื่อมีโน้ตใหม่โดยไม่รีเฟรช
2. **Caching** — cache สถิติที่ `/stats` ชั่วคราว (Redis หรือ HTTP cache)
3. **Testing** — unit ทดสอบ `toPublicJSON` / validators, e2e ครอบ SSO mock + แปะโน้ต
4. **Observability** — structured logging, error tracking (เช่น Sentry), uptime ของ Render cold start
5. **CI/CD** — GitHub Actions รัน lint/build/test ก่อน deploy

### Q31: ปัญหา cold start ของ Render แก้/บรรเทาอย่างไร?
**A:** Free tier ของ Render อาจหลับเมื่อไม่มีทราฟฟิก — ตอนนี้ UI มีข้อความ “เซิร์ฟเวอร์กำลังตื่น…”  
ต่อยอดได้ด้วย health ping ตามช่วงเวลา, ย้าย API ไปแผนที่ไม่ sleep, หรือ edge/serverless ที่ตื่นเร็วกว่า (ต้องออกแบบ cookie/CORS ใหม่)

### Q32: จะขยายไปนอก KMITL ได้ไหม?
**A:** ได้ แต่ต้องแยกชั้น identity provider — ตอนนี้ผูกกับ KMITL OIDC และแคตตาล็อกคณะ/สาขา KMITL  
ถ้าจะรองรับสถาบันอื่น ควร abstract ชั้น SSO + แมปบัตรประจำตัวนักศึกษา/คณะ เป็น config ต่อองค์กร

### Q33: ความเป็นส่วนตัวยังเสริมได้อีกอย่างไร?
**A:**
- จำกัดอัตราโพสต์ต่อผู้ใช้ให้ชัดเจนขึ้น
- ตรวจเนื้อหาไม่เหมาะสม (moderation queue / คำหยาบ)
- Audit log ฝั่งแอดมินว่าใครลบโน้ตเมื่อไร
- Policy ชัดเจนเรื่องการเก็บข้อมูล identity บนเซิร์ฟเวอร์และการลบบัญชี (right to erasure)

### Q34: ฟีเจอร์ที่ “ไม่ควร” ทำโดยไม่คิดให้ดี?
**A:**
- แสดงชื่อจริง/รหัสบนกระดาน — ขัดเจตนาหลักของผลิตภัณฑ์
- แชทส่วนตัวระบุตัวตน — เปลี่ยนจาก anonymous board เป็น social network
- เปิด API public โดยไม่มี auth — สแปมและ doxxing ได้ง่าย

### Q35: แผนต่อยอดที่แนะนำเป็นลำดับสั้นๆ
**A:**
1. **เสถียรภาพ** — ทดสอบอัตโนมัติ + แก้ cold start / error UX  
2. **การมีส่วนร่วม** — ปฏิกิริยา / แท็ก / สรุปมู้ดรายวัน  
3. **ความปลอดภัยชุมชน** — report + คิวแอดมิน  
4. **Realtime board** — เมื่อมีผู้ใช้พร้อมกันมากขึ้น

---

## ชุดถามเร็ว (Quick fire)

| คำถามสั้น | คำตอบสั้น |
|-----------|-----------|
| ชื่อเว็บ? | Ultra SAMOOD / Mood of the Major |
| กลุ่มเป้าหมาย? | นักศึกษา KMITL |
| Auth? | KMITL SSO (OIDC) เท่านั้น |
| DB? | MongoDB |
| Frontend? | React + TS + Vite + Tailwind |
| Backend? | Express + Mongoose |
| Deploy? | Vercel + Render + Atlas |
| ข้อมูลที่โชว์บนโน้ต? | alias, คณะ, สาขา, ปี |
| จุดขาย? | ระบายมู้ดในแคมปัสแบบไม่ระบุชื่อ |
| ต่อยอดแรกที่คุ้ม? | report/moderation + สรุปมู้ดรายวัน + ลด cold start |

---

*อ้างอิงจากโค้ดและเอกสารใน repo (`README.md`, `DEPLOY.md`, `client/`, `server/`)*
