const User = require( '../models/user' )
const jwt = require( 'jsonwebtoken' );
const bcrypt = require( "bcrypt" )
const crypto = require( "crypto" )
const { handleErrors, transporter } = require( '../common/functions' );


const maxAge = 3 * 24 * 60 * 60;
const createToken = ( id ) => {
    return jwt.sign( { id }, 'Secret', {
        expiresIn: maxAge
    } )
}

module.exports.signup_get = ( req, res ) => {
    res.render( 'signup' )
}
module.exports.login_get = ( req, res ) => {
    res.render( 'login' )
}
module.exports.signup_post = async ( req, res ) => {
    const { email, password } = req.body;
    try {
        const user = await User.create( {
            email,
            password: bcrypt.hashSync( password, 10 ),
            emailToken: crypto.randomBytes( 64 ).toString( "hex" ),
            isVerified: false
        } );

        let mailOptions = {
            from: 'Tasty Smoothies "doditank1603@gmail.com"',
            to: user.email,
            subject: "Verify Your Email",
            html: `<h1>VERIFICATION ALERT</h1>
            <a href="http://${req.headers.host}/verify-email?token=${user.emailToken}">verify</a>`
        }

        transporter.sendMail( mailOptions, ( err, info ) => {
            if ( err ) console.log( "error", err );
            else console.log( "mail sent!!!" );
        } )

        // const token = createToken( user._id )
        // res.cookie( 'jwt', token, { httpOnly: true, maxAge: maxAge * 1000 } );
        // res.status( 201 ).json( { user: user._id } )
    } catch ( err ) {
        const errors = handleErrors( err )
        res.status( 400 ).json( { errors: errors } )
    }
}
module.exports.login_post = async ( req, res ) => {
    const { email, password } = req.body;
    try {
        const user = await User.login( email, password )
        const token = createToken( user._id )
        res.cookie( 'jwt', token, { httpOnly: true, maxAge: maxAge * 1000 } );
        res.status( 200 ).json( { user: user._id } )
    } catch ( err ) {
        const errors = handleErrors( err )
        res.status( 400 ).json( { errors } )
    }
}

module.exports.logout_get = ( req, res ) => {
    res.cookie( 'jwt', '', { maxAge: 1 } )
    res.redirect( '/' )
}


module.exports.verification = async ( req, res ) => {
    try {
        const token = req.query.token;
        const user = await User.findOne( { emailToken: token } );
        if ( user ) {
            user.emailToken = null;
            user.isVerified = true;

            await user.save( ( err ) => { if ( err ) console.log( err ); } );
            res.redirect( "/" )
        }
    }
    catch ( err ) {
        console.log( err );
        res.redirect( "/signup" )
    }
}