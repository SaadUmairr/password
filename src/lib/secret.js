import {
    GetParameterCommand,
    GetParametersByPathCommand,
    SSMClient,
} from "@aws-sdk/client-ssm";

async function getDatabaseURL() {
    const client = new SSMClient({ region: process.env.AWS_IAM_REGION });
    const paramStoreData = {
        Name: process.env.DATABASE_SSM_PARAM,
        WithDecryption: true,
    };
    const command = new GetParameterCommand(paramStoreData);
    const result = await client.send(command);
    return result.Parameter.Value;
}

async function getAccessAndRefreshTokenSecret() {
    const client = new SSMClient({ region: process.env.AWS_IAM_REGION });
    const paramStoreData = {
        Path: process.env.JWT_SECRET_PATH_SSM_PARAM,
        WithDecryption: true,
    };
    const command = new GetParametersByPathCommand(paramStoreData);
    const result = await client.send(command);

    const secrets = {};

    result.Parameters.map((secret) => {
        if (secret.Name === process.env.ACCESS_TOKEN_SECRET_SSM_PARAM)
            secrets.accessTokenSecret = secret.Value;
        if (secret.Name === process.env.SECRET_TOKEN_SECRET_SSM_PARAM)
            secrets.refreshTokenSecret = secret.Value;
    });

    return secrets;
}

async function getAccessTokenSecret() {
    const client = new SSMClient({ region: process.env.AWS_IAM_REGION });
    const paramStoreData = {
        Name: process.env.ACCESS_TOKEN_SECRET_SSM_PARAM,
        WithDecryption: true,
    };
    const command = new GetParameterCommand(paramStoreData);
    const result = await client.send(command);
    return result.Parameter.Value;
}
async function getRefreshTokenSecret() {
    const client = new SSMClient({ region: process.env.AWS_IAM_REGION });
    const paramStoreData = {
        Name: process.env.REFRESH_TOKEN_SECRET_SSM_PARAM,
        WithDecryption: true,
    };
    const command = new GetParameterCommand(paramStoreData);
    const result = await client.send(command);
    return result.Parameter.Value;
}

export {
    getAccessAndRefreshTokenSecret,
    getAccessTokenSecret,
    getDatabaseURL,
    getRefreshTokenSecret,
};
