import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getUserId = async email => {
  const createData = await prisma.$queryRaw`
        SELECT
          id 
        FROM 
          users
        WHERE
          email=${email};
        `;

  return createData;
};

const isExistUser = async user_id => {
  return await prisma.$queryRaw`
    SELECT EXISTS(
      SELECT
        id
      FROM
        users
      WHERE
        id = ${user_id}
    ) as result
  `;
};

const createUser = async (email, name) => {
  const createData = await prisma.$queryRaw`
        INSERT INTO 
          users (email, name) 
        VALUES 
          (${email}, ${name});
        `;

  return createData;
};

const isExistEmail = async email => {
  const [user] = await prisma.$queryRaw`
    SELECT 
      email,name 
    FROM 
      users 
    WHERE 
      email = ${email};
    `;
  return user;
};

const postReview = async (userId, styleCode, color, size, comfort, width) => {
  const [review] = await prisma.$queryRaw`
    INSERT INTO 
      product_reviews (user_id, style_code, color, size, comfort, width) 
    VALUES 
      (${userId}, ${styleCode}, ${color}, ${size}, ${comfort}, ${width})
  `;
  return review;
};

const countPlus = async styleCode => {
  const [count] = await prisma.$queryRaw`
    UPDATE
      products
    SET
      review_counts=review_counts+1
    WHERE
      style_code = ${styleCode}
  `;
  return count;
};

const getReview = async (userId, styleCode) => {
  const [review] = await prisma.$queryRaw`
    SELECT 
      user_id, style_code, color, size, comfort, width
    FROM 
      product_reviews
    WHERE
      user_id=${userId} and style_code=${styleCode};
  `;

  return review;
};

const getReviewAverage = async styleCode => {
  const [review] = await prisma.$queryRaw`
    SELECT 
      style_code,
      avg(color) as colorAverage,
      avg(size) as sizeAverage,
      avg(comfort) as comfortAverage,
      avg(width) as widthAverage,
      (avg(color)+avg(size)+avg(comfort)+avg(width))/4 as totalAverage
    FROM 
      product_reviews
    WHERE
      style_code=${styleCode}
    GROUP BY
      style_code;
  `;

  return review;
};

const memberAuthorization = async id => {
  const member = await prisma.$queryRaw`
    UPDATE
      users
    SET
      is_member=1
    WHERE
      id=${id};
  `;

  return member;
};

const isAuthorization = async userId => {
  const [member] = await prisma.$queryRaw`
    SELECT
      id
    FROM
      users
    WHERE
      id=${userId} and is_member=1;
  `;

  return member;
};

export default {
  postReview,
  getReview,
  getReviewAverage,
  memberAuthorization,
  isAuthorization,
  createUser,
  isExistEmail,
  getUserId,
  countPlus,
  isExistUser,
};
