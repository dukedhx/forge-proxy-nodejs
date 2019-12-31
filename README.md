[![Build Status](https://travis-ci.org/dukedhx/forge-proxy-nodejs.svg?branch=master)](https://travis-ci.org/dukedhx/forge-proxy-nodejs)
[![License](http://img.shields.io/:license-mit-blue.svg)](http://opensource.org/licenses/MIT)
[![Standard](https://img.shields.io/badge/Standard-Style-green.svg)](https://github.com/standard/standard)
[![Autodesk Forge](https://img.shields.io/badge/Autodesk-Forge-orange.svg)](https://forge.autodesk.com/)

## Description

Reference implementation of proxy and cache service for the Autodesk Forge platform

# The What, Why and When

This project is intended as a sample implementation of proxy and cache functionality as part of your Forge workflow, that is to retrieve OAuth access tokens from the Forge service on behalf of the client, inject them into the requests and forward them onto the intended Forge endpoints. Once the response came back you can optionally cache the response in string or binary format with expiry age and access control available for configuration.

See these articles ([here](https://forge.autodesk.com/blog/api-key-security-considerations) and [here](https://forge.autodesk.com/blog/securing-your-forge-viewer-token-behind-proxy-net)) about the rationale and motivation to employ a proxy as well as a simpler proxy sample [here](https://github.com/yiskang/forge-proxy-server). Basically adding a proxy/cache layer to our Forge apps can help boost the security, stability and latency of our workflow - access tokens would be hidden completely from the client who can be considered as tenants to your services so access tokens can be reused for clients of workflows under the same Forge credentials so as to cut the latency of having to retrieve access tokens for each and every client requests, with a view to keeping client data strictly isolated as your app has total control to what the clients can access. Responses from the Forge endpoints are passed to the clients w/o buffering/temporary persistence within our app, not to add pressure on the backend, and the contents can be optionally cached aside as binary or string formats for instant resolution of future request.

Broker/middleware approach as such is especially useful when we have multiple clients with similar business requirements to be fulfilled by the same Forge workflows so that there's greater potential for latency/performance benefits to share access tokens and cached response among tenancies. And the proxy service can be deployed to near client locations to further improve latency and availability so we can focus our networking optimization to speed up traffic between the proxy service and Forge.


# Architecture

You can either integrate this sample into your backend or deploy as a standalone broker app to your favorite cloud platform and even marshall a group of containers to form a service cluster for greater scalability and availability. See the below chart for a reference deployment paradigm:


# Setup and Run

## Prerequisites
- [Forge account](https://forge.autodesk.com/developer/getting-started)
- Node.JS (install [here](https://nodejs.org/en/download/)) or Docker (install [here](https://docs.docker.com/get-started/))

## Run as Node.js app

- Clone the repo from GitHub
- `npm install`
- Set up the client profiles (see next section for details)
- `npm start`
- Access Forge endpoints through the broker, e.g. http://localhost:3000/oss/v2/buckets

## Run as container

If Node.js is not part of the picture for your environment then go with the containerized approach:

- Prepare the image

Option A: pull the image from the Docker Hub

`docker pull dukedhx/forge-proxy-cache`

Option B: build the image from Dockerfile , you may customize the image by editing the Dockerfile in the sample

Navigate to the project folder and run `docker build -t NameOfYourImage .`

- Run the container, set up the client profiles and create directories to store the config files, cache flat files and database files:

`docker run -v '/path/to/config':'/usr/src/forge-proxy-cache/config' -v '/path/to/cache':'/usr/src/forge-proxy-cache/cache' -v '/path/to/db':'/usr/src/forge-proxy-cache/db' -p 3000:3000 dukedhx/forge-proxy-cache`

- Access Forge endpoints through the broker, e.g. http://localhost:3000/oss/v2/buckets

# Configuration

Set the authentication and caching profiles in `config/default.json`:

```
{
  "forge_host":"https://developer.api.autodesk.com",
  "clientProfile":[
       {
           "id": "xxx",
           "header-key": "x-my-header-key",
           "authProfile": "xxx",
           "cacheProfile": "xxx"
       }
     ],
   "authProfile": [
       {
           "id": "xxx",
           "clientId": "",
           "clientSecret": "",
           "scope": "",
           "scope-header-key": "xxx",
           "redirectURL": "xxx"
       }
     ],
   "cacheConfig": [
       {
           "id": "xxx",
           "cacheConfig": [{
                       "path": ["oss/*", "derivative/*"],  // or simply 'path/to/cache'
                       "age": 65535, // in seconds
                       "content": "binary/string"
                     }
                  ]
       },
       {
           "id": "xxxx",
           "parent": "xxx"  // inherit settings from a parent
       }
     ]
}
```

## License

[MIT](http://opensource.org/licenses/MIT)

## Written By

[Bryan Huang](https://www.linkedin.com/in/bryan-huang-1447b862) - Forge Partner Development https://forge.autodesk.com
