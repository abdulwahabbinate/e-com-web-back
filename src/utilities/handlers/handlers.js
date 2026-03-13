exports.handlers = {
  logger: {
    success: ({ object_type, code = 200, message, data = null }) =>
      console.info({ object_type, code, status: 1, message, data }),

    failed: ({ object_type, code = 400, message, data = null }) =>
      console.error({ object_type, code, status: 0, message, data }),

    error: ({ object_type, code = 500, message, data = null }) =>
      console.error({ object_type, code, status: 0, message, data }),

    unavailable: ({ object_type, code = 404, message, data = null }) =>
      console.warn({ object_type, code, status: 0, message, data }),

    unauthorized: ({ object_type, code = 403, message, data = null }) =>
      console.warn({ object_type, code, status: 0, message, data }),

    nocontent: ({
      object_type,
      code = 200,
      message = "No Content",
      data = null,
    }) => console.info({ object_type, code, status: 1, message, data }),
  },

  response: {
    success: ({ res, code = 200, message, data = null }) =>
      res.status(code).send({ status: 1, message, data }),

    failed: ({ res, code = 400, message, data = null }) =>
      res.status(code).send({ status: 0, message, data }),

    error: ({ res, code = 500, message, data = null }) =>
      res.status(code).send({ status: 0, message, data }),

    unavailable: ({ res, code = 404, message, data = null }) =>
      res.status(code).send({ status: 0, message, data }),

    unauthorized: ({ res, code = 403, message, data = null }) =>
      res.status(code).send({ status: 0, message, data }),

    nocontent: ({ res, code = 200, message = "No Content", data = null }) =>
      res.status(code).send({ status: 1, message, data }),
  },
};
