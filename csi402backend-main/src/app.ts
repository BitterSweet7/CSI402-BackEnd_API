import express from "express";
import { Request, Response } from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

interface MemberPoint {
  memberId: string;    
  totalPoints: number; 
}

// กำหนดให้ User ทุกคนเริ่มต้นที่ 1000 แต้ม
const memberPointsData: MemberPoint[] = [
  { memberId: "SPU0001", totalPoints: 1000 },
  { memberId: "SPU0002", totalPoints: 1000 },
  { memberId: "SPU0003", totalPoints: 1000 },
  { memberId: "SPU0004", totalPoints: 1000 },
  { memberId: "SPU0005", totalPoints: 1000 },
];

// ช่วยค้นหาสมาชิก
const findMember = (memberId: string): MemberPoint | undefined => {
  return memberPointsData.find((member) => member.memberId === memberId);
};

app.post("/spu-member/accumulate", (req: Request, res: Response) => {
  try {
    const { memberId, amountPaid } = req.body;

    // ตรวจสอบความถูกต้องของ request body
    if (!memberId || !amountPaid) {
      return res.status(400).json({
        status: "400",
        msg: "Missing memberId or amountPaid in request body",
      });
    }

    // ค้นหาข้อมูลสมาชิก
    const member = findMember(memberId);
    if (!member) {
      return res.status(400).json({
        status: "400",
        msg: "ไม่พบสมาชิก",
      });
    }

    // คำนวณแต้มที่ได้ ทุก 100 บาท = 10 แต้ม
    const earnedPoints = Math.floor(amountPaid / 100) * 10;
    const newTotal = member.totalPoints + earnedPoints;

    // ไม่จำกัดแต้มสะสม (จึงไม่เช็คว่า newTotal > 1000 อีกต่อไป)
    member.totalPoints = newTotal;

    // ส่ง Response
    return res.status(200).json({
      status: "200",
      msg: "เพิ่มแต้มสำเร็จ",
      data: {
        memberId: member.memberId,
        earnedPoints: earnedPoints,
        totalPoints: member.totalPoints,
      },
    });
  } catch (error) {
    console.error("Unexpected Error:", error);
    return res.status(500).json({
      status: "500",
      msg: "Internal Server Error",
    });
  }
});

app.get("/spu-member/balance/:memberId", (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;

    const member = findMember(memberId);
    if (!member) {
      return res.status(400).json({
        status: "400",
        msg: "ไม่พบสมาชิก",
      });
    }

    return res.status(200).json({
      status: "200",
      msg: "OK",
      data: {
        memberId: member.memberId,
        totalPoints: member.totalPoints,
      },
    });
  } catch (error) {
    console.error("Unexpected Error:", error);
    return res.status(500).json({
      status: "500",
      msg: "Internal Server Error",
    });
  }
});

// ------------------------------------
// เริ่มต้นรัน Server
// ------------------------------------
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
