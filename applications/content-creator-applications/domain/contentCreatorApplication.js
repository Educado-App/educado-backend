module.exports = function buildMakeContentCreatorApplication({ Id }) {

    return function makeContentCreatorApplication({
        id = Id.makeId(),
        name,
        email,
        password,
        approved = false,
        createdAt = new Date(),
        modifiedAt = new Date()
    }) {

        if (!name) throw new Error('A name must be provided in the application')
        if (!email) throw new Error('An email must be provided in the application')

        let rejectReason = ''

        return Object.freeze({
            getId: () => id,
            getname: () => name,
            getEmail: () => email,
            getPassword: () => password,
            isApproved: () => approved,
            getRejectReason: () => rejectReason,
            getCreatedAt: () => createdAt,
            getModifiedAt: () => modifiedAt,
            fullname: () => `${firstName} ${lastName}`,
            approve: () => approved = true,
            decline: ({ reason = 'No reason given' } = {}) => {
                approved = false
                rejectReason = reason
            }
        })
    }
}