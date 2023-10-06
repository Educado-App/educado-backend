function makeExpressCallback(endpointHandler) {

    return async function callback(req, res) {

        const httpRequest = {
            method: req.method,
            body: req.body,
            params: req.params,
            queryParams: req.query,
            ip: req.ip,
            context: req.context,
            headers: {
                'Content-Type': req.get('Content-Type'),
                'Referer': req.get('referer'),
                'User-Agent': req.get('User-Agent')
            }
        }

        const response = await endpointHandler(httpRequest)

        res.status(response.status)
        res.send(response)
    }
}

module.exports = { makeExpressCallback }