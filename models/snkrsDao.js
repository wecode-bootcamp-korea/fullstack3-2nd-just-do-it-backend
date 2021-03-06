import { PrismaClient } from '@prisma/client';
import { AffectedRow } from '../utils/err';
import { createType, updateType } from '../type';

const prisma = new PrismaClient();

const updataOpenClose = async (bool, style_code) => {
  return await prisma.$queryRaw`
    UPDATE
      snkrs
    SET
      is_open = ${bool}
    WHERE
      style_code = ${style_code}
  `;
};

const addLottoBox = async (user_id, style_code, size) => {
  await prisma.$queryRaw`
    INSERT INTO
      snkrs_data(
        style_code,
        user_id,
        size
      )
    VALUES(
      ${style_code},
      ${user_id},
      ${size}
    );
  `;

  const [row] = await prisma.$queryRaw`
    SELECT ROW_COUNT() as result;
  `;
  const newRow = new AffectedRow(row, createType, 409);
  newRow.result();

  return;
};

const addWinnerBox = async (user_id, style_code, size) => {
  await prisma.$queryRaw`
    INSERT INTO
      snkrs_winners(
        style_code,
        user_id,
        size
      )
    VALUES(
      ${style_code},
      ${user_id},
      ${size}
    );
  `;

  const [row] = await prisma.$queryRaw`
    SELECT ROW_COUNT() as result;
  `;

  const newRow = new AffectedRow(row, createType, 409);
  newRow.result();

  return;
};

const isExistStyleCode = async style_code => {
  return await prisma.$queryRaw`
    SELECT EXISTS(
      SELECT
        style_code
      FROM
        snkrs
      WHERE
        style_code = ${style_code}
    ) as result
  `;
};

const isExistSizes = async (style_code, size) => {
  return await prisma.$queryRaw`
    SELECT EXISTS(
      SELECT
        snkrs.style_code,
        product_sizes.name
      FROM
        snkrs
      JOIN
        snkrs_with_sizes ON snkrs_with_sizes.style_code = snkrs.style_code
      JOIN
        product_sizes ON snkrs_with_sizes.product_size_id = product_sizes.id
      WHERE
        snkrs.style_code = ${style_code}
      AND
        product_sizes.name = ${size}
    ) as result;
  `;
};

const checkUserLottoBox = async (user_id, style_code) => {
  return await prisma.$queryRaw`
    SELECT EXISTS(
      SELECT
        style_code,
        user_id
      FROM
        snkrs_data
      WHERE
        user_id = ${user_id} AND style_code = ${style_code}
    ) as result
    `;
};

const checkUserWinnerBox = async style_code => {
  return await prisma.$queryRaw`
    SELECT EXISTS(
      SELECT
        style_code,
        user_id
      FROM
        snkrs_winners
      WHERE
        style_code = ${style_code}
    ) as result;
    `;
};

const getNumOfParticipants = async style_code => {
  return await prisma.$queryRaw`
    SELECT
      style_code,
      user_id
    FROM
      snkrs_data
    WHERE
      style_code = ${style_code};
  `;
};

const getCount = async style_code => {
  return await prisma.$queryRaw`
    SELECT
      MAX(count)
    FROM  
      snkrs_winners
    WHERE
      snkrs_winners.style_code = ${style_code};
  `;
};

const selectWinner = async style_code => {
  return await prisma.$queryRaw`
    SELECT
      style_code,
      user_id,
      size
    FROM
      snkrs_data
    WHERE
      style_code = ${style_code}
    ORDER BY
      rand()
    LIMIT
      1; 
  `;
};

const deleteLottoBox = async style_code => {
  const currentPeople = await getNumOfParticipants(style_code);

  await prisma.$queryRaw`
    DELETE FROM
      snkrs_data
    WHERE
      style_code = ${style_code};
  `;

  const [row] = await prisma.$queryRaw`
    SELECT ROW_COUNT() as result;
  `;

  const newRow = new AffectedRow(row, currentPeople.length, 409);
  newRow.results();

  return;
};

const updateWinner = async (style_code, user_id) => {
  await prisma.$queryRaw`
    UPDATE
      snkrs_winners
    SET
      is_winner = true
    WHERE
      style_code = ${style_code} AND user_id = ${user_id}
    ORDER BY
      create_at DESC
    LIMIT
      1;
  `;

  const [row] = await prisma.$queryRaw`
    SELECT ROW_COUNT() as result;
  `;

  const newRow = new AffectedRow(row, updateType, 409);
  newRow.result();

  return;
};

const updateCount = async (style_code, count, currentPeople) => {
  await prisma.$queryRaw`
    UPDATE
      snkrs_winners
    SET
      count = ${count}
    WHERE
      style_code = ${style_code}
    ORDER BY
      create_at DESC
    LIMIT
      ${currentPeople}
  `;

  const [row] = await prisma.$queryRaw`
    SELECT ROW_COUNT() as result;
  `;

  const newRow = new AffectedRow(row, currentPeople, 409);
  newRow.results();
  return;
};

const getWinnerList = async (user_id, style_code) => {
  return await prisma.$queryRaw`
    SELECT
      snkrs_winners.style_code,
      users.name,
      users.email,
      size,
      is_winner,
      count,
      snkrs.name as product_name,
      snkrs_winners.create_at
    FROM
      snkrs_winners
    JOIN
      users ON user_id = users.id
    JOIN
      snkrs ON snkrs_winners.style_code = snkrs.style_code
    WHERE
      user_id = ${user_id}
    AND
      snkrs_winners.style_code = ${style_code};
  `;
};

const getSnkrsList = async () => {
  const list = await prisma.$queryRaw`
    SELECT
      categories.name as categoryName,
      snkrs.style_code,
      snkrs.name as snkrsName,
      snkrs.price,
      snkrs_img_urls.name as imgUrl,
      snkrs.color_id as colorId,
      product_colors.name as colorName,
      snkrs.is_open
    FROM
      snkrs
    JOIN
      categories ON snkrs.category_id=categories.id
    JOIN
      snkrs_img_urls ON snkrs.style_code=snkrs_img_urls.style_code
    LEFT JOIN 
      product_colors ON snkrs.color_id=product_colors.id
    WHERE
      snkrs_img_urls.is_main=1;
  `;
  return list;
};

const getSnkrsData = async style_code => {
  return await prisma.$queryRaw`
    SELECT
      s.style_code,
      s.name,
      categories.name as category,
      product_colors.name as color,
      product_colors.color_hex as hex,
      product_genders.name as gender,
      price,
      is_open,
      (
        SELECT JSON_ARRAYAGG(JSON_OBJECT('url', snkrs_img_urls.name, 'is_main', is_main))
        FROM snkrs_img_urls
        JOIN snkrs ON snkrs.style_code = snkrs_img_urls.style_code
        WHERE snkrs_img_urls.style_code = ${style_code}
      ) AS img,
      (
        SELECT JSON_ARRAYAGG(JSON_OBJECT('size', product_sizes.name, 'quantity', snkrs_with_sizes.quantity))
        FROM snkrs_with_sizes
        JOIN snkrs ON snkrs.style_code = snkrs_with_sizes.style_code
        JOIN product_sizes ON product_size_id = product_sizes.id
        WHERE snkrs_with_sizes.style_code = ${style_code}
      ) AS info
    FROM
      snkrs as s
    JOIN
      categories ON category_id = categories.id
    JOIN
      product_colors ON color_id = product_colors.id
    JOIN
      product_genders ON gender_id = product_genders.id
    WHERE
      s.style_code = ${style_code};
`;
};

export default {
  updataOpenClose,
  addLottoBox,
  checkUserLottoBox,
  checkUserWinnerBox,
  selectWinner,
  addWinnerBox,
  deleteLottoBox,
  updateWinner,
  updateCount,
  getNumOfParticipants,
  getWinnerList,
  getCount,
  getSnkrsList,
  getSnkrsData,
  isExistStyleCode,
  isExistSizes,
};
