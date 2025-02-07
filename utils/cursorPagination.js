const getAll = async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit, 10) || 10;
      const cursor = req.query.cursor;
      const prevCursorQuery = req.query.prev_cursor;
  
      if (cursor && prevCursorQuery) {
        return res.status(400).json({ error: "Provide only one of 'cursor' or 'prev_cursor'" });
      }
  
      let whereClause = {};
      let order;
  
      if (cursor) {
        whereClause.id = { [Op.lt]: cursor };
        order = [['id', 'DESC']];
      } else if (prevCursorQuery) {
        whereClause.id = { [Op.gt]: prevCursorQuery };
        order = [['id', 'ASC']];
      } else {
        order = [['id', 'DESC']];
      }
  
      const rows = await User.findAll({
        where: whereClause,
        attributes: { exclude: ['password'] },
        order,
        include: [{ model: Permission, as: 'permission' }],
        limit: limit + 1
      });
  
      const totalCount = await User.count();
  
      let nextCursor = null;
      let prevCursor = null;
      let data = rows;
  
      if (data.length > limit) {
        if (cursor || (!cursor && !prevCursorQuery)) {
          nextCursor = data.pop().id;
        } else if (prevCursorQuery) {
          prevCursor = data.shift().id;
        }
      }
  
      if (prevCursorQuery) {
        data = data.reverse();
      }
  
      if ((cursor || (!cursor && !prevCursorQuery)) && data.length > 0) {
        prevCursor = data[0].id;
      }
  
      if (!cursor && !prevCursorQuery) {
        prevCursor = null;
      }
  
      const next = nextCursor ? `?limit=${limit}&cursor=${encodeURIComponent(nextCursor)}` : null;
      const prev = prevCursor ? `?limit=${limit}&prev_cursor=${encodeURIComponent(prevCursor)}` : null;
  
      return res.status(200).json(message(true, 'Users retrieved successfully', data, totalCount, {next, prev}))
    } catch (error) {
      next(error);
    }
  };