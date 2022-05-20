const nodemailer = require( "nodemailer" )

module.exports.transporter = nodemailer.createTransport( {
    service: "gmail",
    auth: {
        user: "doditank1603@gmail.com",
        pass: "Doditank@1603"
    },
    tls: {
        rejectUnauthorized: false,
    },

} )

module.exports.handleErrors = ( err ) => {
    let errors = { email: '', password: '' }

    //Incorrect email
    if ( err.message === 'Incorrect Email' ) {
        errors.email = "The Email is not registered"
    }

    //Incorrect Password
    if ( err.message === 'Incorrect Password' ) {
        errors.password = "The Password is Incorrect"
    }

    //Duplicatre errors code
    if ( err.code === 11000 ) {
        errors.email = 'Email already registered'
        return errors;
    }

    //validation errors 
    if ( err.message.includes( 'user validation failed' ) ) {
        Object.values( err.errors ).forEach( ( { properties } ) => {
            errors[properties.path] = properties.message
        } )
    }
    return errors;
}
