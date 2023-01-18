const User = require("../models/user");

const {
  PHONE_NOT_FOUND_ERR,
  PHONE_ALREADY_EXISTS_ERR,
  USER_NOT_FOUND_ERR,
  INCORRECT_OTP_ERR,
} = require("../errors");

// const { checkPassword, hashPassword } = require("../utils/password.util");
const { createJwtToken } = require("../utils/token");

const { generateOTP, fast2smss } = require("../utils/otp");
const { FAST2SMS } = require("../config");
const { sendMail } = require("../utils/emailUtil");

// --------------------- create new user ---------------------------------

const createNewUser = async (req, res, next) => {
  try {
    let { phone, name, email } = req.body;

    // check duplicate phone Number
    const phoneExist = await User.findOne({ phone });

    if (phoneExist) {
      next({ status: 400, message: PHONE_ALREADY_EXISTS_ERR });
      return;
    }

    // create new user
    const createUser = new User({
      phone,
      name,
      email,
    });

    // save user

    const user = await createUser.save();
    await fast2smss(
      {
        message: `Welcome to the goa company`,
        contactNumber: user.phone,
      },
      next
    );
    sendMail(user.email, `welcome message`, "Welcome to the goa company");
    res.status(201).json({
      type: "success",
      message: "Account created",
      data: {
        userId: user._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ------------ login with phone otp ----------------------------------

const loginUser = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      next({ status: 400, message: PHONE_NOT_FOUND_ERR });
      return;
    }
    if (!user.isAccountVerified) {
      next({
        status: 400,
        message: "please verify email and mobile otp before login!",
      });
      return;
    }

    const token = createJwtToken({ userId: user._id });
    res.status(201).json({
      type: "success",
      message: "successully login!",
      data: {
        userId: user._id,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// --------------- otp create ------------------

const createMobileOtp = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      next({ status: 400, message: USER_NOT_FOUND_ERR });
      return;
    }
    // generate otp
    const otp = generateOTP(6);
    // save otp to user collection
    user.phoneOtp = otp;
    // user.emailOtp = otp;
    await user.save();
    // send otp to phone number
    await fast2smss(
      {
        message: `Your OTP is ${otp}`,
        contactNumber: user.phone,
      },
      next
    );

    res.status(200).json({
      type: "success",
      message: "OTP generated successfully",
      data: {
        userId: user._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createEmailOtp = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      next({ status: 400, message: USER_NOT_FOUND_ERR });
      return;
    }
    // generate otp
    const otp = generateOTP(6);
    // save otp to user collection
    user.emailOtp = otp;
    await user.save();
    // send otp to email
    sendMail(user.email, "otp", `Your otp is ${otp}`);
    res.status(200).json({
      type: "success",
      message: "OTP generated successfully",
      data: {
        userId: user._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------- verify phone otp -------------------------

const verifyPhoneOtp = async (req, res, next) => {
  try {
    const { otp, userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      next({ status: 400, message: USER_NOT_FOUND_ERR });
      return;
    }

    if (user.phoneOtp !== otp) {
      next({ status: 400, message: INCORRECT_OTP_ERR });
      return;
    }

    user.phoneOtp = "";
    user.isMobileVerified = true;
    if (user.isEmailVerified) {
      user.isAccountVerified = true;
    }
    await user.save();

    res.status(200).json({
      type: "success",
      message: "OTP verified successfully",
      data: {
        userId: user._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { otp, userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      next({ status: 400, message: USER_NOT_FOUND_ERR });
      return;
    }

    if (user.emailOtp !== otp) {
      next({ status: 400, message: INCORRECT_OTP_ERR });
      return;
    }

    user.emailOtp = "";
    user.isEmailVerified = true;
    if (user.isMobileVerified) {
      user.isAccountVerified = true;
    }
    await user.save();

    res.status(200).json({
      type: "success",
      message: "OTP verified successfully",
      data: {
        userId: user._id,
      },
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  verifyPhoneOtp,
  createNewUser,
  loginUser,
  createEmailOtp,
  createMobileOtp,
  verifyEmail,
};
