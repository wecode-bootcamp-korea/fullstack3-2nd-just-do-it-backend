import { userDao } from '../models';
import token from '../utils/token';
import axios from 'axios';

const signIn = async accessToken => {
  // accessToken으로 kakao API에 접근하여 사용자 정보 취득
  const user = await axios.get('https://kapi.kakao.com/v2/user/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
  });

  if (!user.data) {
    const err = new Error('INVALID_USER');
    err.statusCode = 400;

    throw err;
  }

  const data = user.data;
  const isExist = await userDao.isExistEmail(data.kakao_account.email);
  let userId;

  if (isExist) {
    userId = await userDao.getUserId(data.kakao_account.email);
    return token.signToken(userId);
  }

  await userDao.createUser(data.kakao_account.email, data.properties.nickname);
  userId = await userDao.getUserId(data.kakao_account.email);
  const signToken = token.signToken(userId);
  return signToken;
};

const postReview = async (userId, styleCode, color, size, comfort, width) => {
  const review = await userDao.getReview(userId, styleCode);

  if (review) {
    const error = new Error('이미 작성한 리뷰가 존재합니다.');
    error.statusCode = 400;

    throw error;
  }
  await userDao.countPlus(styleCode);
  return await userDao.postReview(
    userId,
    styleCode,
    color,
    size,
    comfort,
    width
  );
};

const getReview = async (userId, styleCode) => {
  const review = await userDao.getReview(userId, styleCode);

  if (!review) {
    const error = new Error('리뷰가 존재하지 않습니다.');
    error.statusCode = 400;

    throw error;
  }

  return review;
};

const getReviewAverage = async styleCode => {
  const review = await userDao.getReviewAverage(styleCode);

  if (!review) {
    const error = new Error('평균을 계산할 리뷰가 충분히 존재하지 않습니다.');
    error.statusCode = 400;

    throw error;
  }

  return review;
};

const memberAuthorization = async userId => {
  const authorization = await userDao.isAuthorization(userId);

  if (authorization) {
    const error = new Error('이미 Member 등급인 회원입니다.');
    error.statusCode = 400;
    throw error;
  }

  const member = await userDao.memberAuthorization(userId);
  return member;
};

export default {
  postReview,
  getReview,
  getReviewAverage,
  memberAuthorization,
  signIn,
};
