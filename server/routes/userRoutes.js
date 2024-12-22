import User from "../models/userModel.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import express from "express";
import transporter from "../config/nodemailer.js";
import userAuth from "../middleware/userAuth.js";
const router = express.Router();
import {
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
} from "../config/emailTemplates.js";
router.get("/get-current-user", userAuth, async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "user not found" });
    }
    // const { password: _, ...rest } = user._doc;
    const { username, isVerified } = user._doc;
    return res.json({ success: true, user: { username, isVerified } });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.json({
        success: false,
        message: "missing fields",
      });
    }
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const user = await User.findOne({ email });
    if (user) {
      return res.json({
        success: false,
        message: "user already exists",
      });
    }
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    const mailOptions = {
      from: "natiizelalem@gmail.com", // Sender's email
      to: email, // Recipient's email
      subject: "test for welcome",
      text: `This is my first test using nodemailer and sendgrid wellcome ${username} `,
      // html: `<button>click to verify</button>`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log("eror sending the email", error);
      }
      console.log("email success", info.response);
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res
      .cookie("token", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        secure: false,
        sameSite: "strict",
      })
      .status(200)
      .json({
        success: true,
        message: "register successful",
      });
  } catch (error) {
    res.json({ success: false, error: error });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({
        success: false,
        message: "missing fields",
      });
    }
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return res.json({
        success: false,
        message: "user does not exist",
      });
    }
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return res.json({
        success: false,
        message: "invalid password",
      });
    }
    const { password: hashedPassword, ...rest } = validUser._doc;
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res
      .cookie("token", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        secure: false,
        sameSite: "strict",
      })
      .status(200)
      .json({
        user: rest,
        success: true,
        message: "Login successful",
      });
  } catch (error) {
    return res.json({
      success: false,
      message: error,
    });
  }
});

router.post("/logout", async (req, res) => {
  try {
    res.clearCookie("token");
    return res.json({
      success: true,
      message: "logged out successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error,
    });
  }
});

router.post("/send-verify-otp", userAuth, async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (user.isVerified) {
      return res.json({
        success: true,
        message: "account already verified",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: "natiizelalem@gmail.com", // Sender's email
      to: user.email, // Recipient's email
      subject: "account verification otp",
      text: `dear ${user.username} your otp is ${otp}, verify your account using it `,
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log("eror sending the email", error);
      }
      console.log("email success", info.response);
    });

    return res.json({
      success: true,
      message: "verification otp sent to email",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/verify-email", userAuth, async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
      return res.json({
        success: false,
        message: "missing details",
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "user not found",
      });
    }
    if (user.verifyOtp === "" || user.verifyOtp != otp) {
      return res.json({
        success: false,
        message: "invalid otp",
      });
    }
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({
        success: false,
        message: "otp expired",
      });
    }
    user.isVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();
    return res.json({
      success: true,
      message: "email verified successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/send-reset-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({
      success: false,
      message: "email is required",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "user not found",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
    await user.save();
    const mailOptions = {
      from: "natiizelalem@gmail.com", // Sender's email
      to: user.email, // Recipient's email
      subject: "password reset otp",
      text: `dear ${user.username} your otp is ${otp}, reset your password using it `,
      // html: `<button>click to verify</button>`,
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log("eror sending the email", error);
      }
      console.log("email success", info.response);
    });
    return res.json({
      success: true,
      message: "reset otp sent to email",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "missing details",
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "user not found",
      });
    }
    if (user.resetOtp === "" || user.resetOtp != otp) {
      return res.json({
        success: false,
        message: "invalid otp",
      });
    }
    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({
        success: false,
        message: "otp expired",
      });
    }
    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();
    return res.json({
      success: true,
      message: "password reset successful",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/is-auth", userAuth, async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);
  if (!user) {
    return res.json({
      success: false,
      message: "user not found",
    });
  }
  try {
    const { username, email, isVerified } = user._doc;
    const data = { username, email, isVerified };
    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
});
export default router;
