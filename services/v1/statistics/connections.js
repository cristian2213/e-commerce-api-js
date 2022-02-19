const { Connection } = require('../../../config/db/models/index');
const errorsHandler = require('../../../helpers/handlers/errorsHandler');
const { literal } = require('sequelize');

async function getUserStatistics(req, res) {
  const { sub: userId } = req.user;
  try {
    const statistics = await Promise.all([
      getAverageOfConnectionPerUser(userId),
    ]);

    return res.status(200).json({
      averageOfConnectionInMinutes: statistics[0],
    });
  } catch (error) {
    errorsHandler(req, res, error);
  }
}

async function getAverageOfConnectionPerUser(userId) {
  const connections = await Connection.findAll({
    attributes: {
      include: [
        [
          literal(`(
        TIMEDIFF(
          CASE
            WHEN
              (SELECT
                connections2.time
              FROM
                  Connections AS connections2
              WHERE
                  connections2.connectionType = 'disconnected'
                      AND connections2.time > Connection.time
                      AND connections2.userId = ${userId}
              LIMIT 1) IS NOT NULL
          THEN
              (
                SELECT
                    connections2.time
                FROM
                    Connections AS connections2
                WHERE
                    connections2.connectionType = 'disconnected'
                        AND connections2.time > Connection.time
                        AND connections2.userId = ${userId}
                LIMIT 1
              )
          END,
          Connection.time)
      )`),
          'time', // ALIAS
        ],
      ],
      exclude: ['id', 'userId', 'connectionType'],
    },
    where: {
      connectionType: 'connected',
      userId,
    },
    order: [['id', 'ASC']],
  });

  const getAverageOfConnections = connections
    .map((connection) => {
      let { time } = connection;
      if (!time) return { totalMinutes: 0 };
      let totalMinutes = 0;
      // "01:24:28" => ["01", "24" , "28"] => [H, M, S]
      time.split(':').forEach((digits, index) => {
        const set = +digits;
        switch (true) {
          case index === 0:
            const minutes = set % 60; // MINUTES
            const hourInMinutes = parseInt(set / 60) * 60 + minutes; // (HOUR => MINUTES) + MINUTES
            totalMinutes += hourInMinutes;
            break;

          case index === 1:
            totalMinutes += set;
            break;

          default:
            totalMinutes += Math.round(set / 60);
            break;
        }
      });
      return {
        totalMinutes,
      };
    })
    .reduce((preValue, currentValue) => {
      return preValue + currentValue.totalMinutes;
    }, 0);

  return getAverageOfConnections;
}

async function getLastSixMounthsOfConnectionsPerUser(req, res) {} // IN HOURS
async function getTimeOfHighestConnectionPerUser(req, res) {}
async function getTenUsersWithTheHighestConnectionTime(req, res) {} // IN HOURS

module.exports = {
  getUserStatistics,
};

// QUERIES:
// const connections = await sequelize.query(
//   `
// SELECT
// connections.id,
// TIMEDIFF(
//   CASE
//     WHEN
//       (SELECT
//         connections2.time
//       FROM
//           Connections AS connections2
//       WHERE
//           connections2.connectionType = 'disconnected'
//               AND connections2.time > connections.time
//               AND connections2.userId = 1
//       LIMIT 1) IS NOT NULL
//   THEN
//       (
//         SELECT
//             connections2.time
//         FROM
//             Connections AS connections2
//         WHERE
//             connections2.connectionType = 'disconnected'
//                 AND connections2.time > connections.time
//                 AND connections2.userId = 1
//         LIMIT 1
//       )
//   END,
//         connections.time) AS 'time'
// FROM
//     Connections AS connections
// WHERE
//     connections.userId = 1
//         AND connections.connectionType = 'connected'
// ORDER BY id ASC;
//     `,
//   { type: QueryTypes.SELECT } // IT DOESN'T RETURN METADATA
// );
