# Photobot Frontend

A frontend for the Photobot app, created in the final project of CS-GY 9223 at NYU.

## Development

Make changes in the `src` folder. 

`npm start` to run a dev server with hot reloading.

## Deployment

This app is deployed to an S3 bucket through a CodePipeline pipeline defined in https://github.com/wdickerson/csgy-9223-photobot-infrastructure. Any modification to the `main` branch results in a new deployment.

## More resources

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), and the ejected so that the webpack config could be modified.