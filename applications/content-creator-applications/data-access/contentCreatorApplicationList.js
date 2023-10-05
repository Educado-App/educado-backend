const findAllSchema = {
  type: 'object',
  properties: {
    'approved': { type: 'boolean' },
    'before': { type: 'string', format: 'date' },
    'after': { type: 'string', format: 'date' }
  },
};

module.exports = function makeContentCreatorApplicationList({ dbModel, Params, ParamsSchema }) {

  return Object.freeze({
    findAll,
    findById,
    add,
    remove,
    update
  });

  async function findAll({
    sortBy = '-createdAt',
    limit = 50,
    offset = 0,
    ...conditions
  } = {}) {

    const { approved, before, after } = Params.validate({
      schema: ParamsSchema.extendFindAllSchema(findAllSchema),
      data: { sortBy, limit, offset, ...conditions }
    });

    const query = {
      $and: [
        typeof approved !== 'undefined' ? { approved } : {},
        before ? { createdAt: { $lte: new Date(before) } } : {},
        after ? { createdAt: { $gte: new Date(after) } } : {},
      ]
    };

    return await dbModel
      .find(query)
      .sort(sortBy)
      .limit(parseInt(limit))
      .skip(parseInt(offset));
  }



  async function findById(id) {
    const result = await dbModel.findById(id);
    const { _id: foundId, ...contentCreatorApplicationInfo } = result._doc;

    return { id: foundId, ...contentCreatorApplicationInfo };
  }

  async function add(contentCreatorApplication) {
    const result = await dbModel.create({
      _id: contentCreatorApplication.id,
      ...contentCreatorApplication
    });

    const { _id: id, ...contentCreatorApplicationInfo } = result._doc;
    return { id, ...contentCreatorApplicationInfo };
  }

  async function remove(contentCreatorApplication) {
    const result = await dbModel.deleteMany(contentCreatorApplication);

    return result.deletedCount;
  }

  async function update({ id: _id, ...changes }) {
    const result = await dbModel.findOneAndUpdate({ _id }, { ...changes }, { new: true });
    return result;
  }
};