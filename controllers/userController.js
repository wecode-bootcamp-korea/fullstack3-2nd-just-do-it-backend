import { userServices } from '../services';

const signIn = async (req, res) => {
  try {
    const accessToken = req.headers.accesstoken;
    if (!accessToken) {
      return res.status(401).json({ message: 'INVALID_KAKAO_TOKEN' });
    }
    const token = await userServices.signIn(accessToken);

    return res.status(201).json({ message: 'LOGIN_SUCCESS', token });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

const postReview = async (req, res) => {
  try {
    const { styleCode, color, size, comfort, width } = req.body;
    const { user_id } = req;
    const review = await userServices.postReview(
      user_id,
      styleCode,
      color,
      size,
      comfort,
      width
    );

    const REQUIRED_KEYS = { user_id, styleCode, color, size, comfort, width };
    for (let key in REQUIRED_KEYS) {
      if (!REQUIRED_KEYS[key]) {
        return res
          .status(400)
          .json({ message: '모든 속성에 대해 리뷰를 입력해주세요.' });
      }
    }

    return res
      .status(200)
      .json({ message: 'REVIEW_POSTED', user_id, styleCode });
  } catch (err) {
    console.log(err);
    return res.status(err.statusCode || 500).json({ message: err.message });
  }
};

const getReview = async (req, res) => {
  try {
    const { styleCode } = req.body;
    const { user_id } = req;
    const review = await userServices.getReview(user_id, styleCode);

    return res.status(200).json({ message: 'THIS_IS_REVIEW', review });
  } catch (err) {
    console.log(err);
    return res.status(err.statusCode || 500).json({ message: err.message });
  }
};

const getReviewAverage = async (req, res) => {
  try {
    const { styleCode } = req.body;
    const review = await userServices.getReviewAverage(styleCode);

    return res.status(200).json({ message: 'THIS_IS_REVIEW_AVERAGE', review });
  } catch (err) {
    console.log(err);
    return res.status(err.statusCode || 500).json({ message: err.message });
  }
};

const memberAuthorization = async (req, res) => {
  try {
    const { user_id } = req;
    const member = await userServices.memberAuthorization(user_id);

    return res.status(200).json({ message: 'MEMBERSHIP_SUCCESS', member });
  } catch (err) {
    console.log(err);
    return res.status(err.statusCode || 500).json({ message: err.message });
  }
};

export default {
  postReview,
  getReview,
  getReviewAverage,
  memberAuthorization,
  signIn,
};
