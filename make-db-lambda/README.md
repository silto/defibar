# Serverless/AWS Lambda cron job to update the protocols db for DEFIBAR

This is an AWS Lambda job deployed and monitored via Serverless.

The job is scheduled to run every day at 5AM UTC.

## Local testing

Install serverless and do the configuration steps (create AWS account,...) :

```
npm i -g serverless
```

Install dependencies :

```
npm i
```

Define the local MongoDb url in env.local (copy env.example and modify value)

Start locally using serverless-offline :

```
npm start
```

## Deployment

When deployed to AWS, the script looks for an AWS Secret named `defibar-database-url` for the database URL.

Once the secret is defined, just run :

```
npm run deploy
```

## Author

**silto** [Github](https://github.com/silto) [Twitter](https://twitter.com/_silto_)
