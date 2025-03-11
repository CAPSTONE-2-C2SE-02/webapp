import jwt from "jsonwebtoken";

class Token {
    generateToken(user, secret, tokenLife) {
        const token = jwt.sign(user, secret, {
            algorithm: 'HS256',
            expiresIn: tokenLife
        });
        return token;
    }

    verifyToken(token, secret) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, secret, (err, decoded) => {
                if(err) return reject(err);
                return resolve(decoded);
            });
        });
    }
}

export const key = new Token();