# About this repository

This repository has two branches

1. master
2. final 

The master branch contains the starter template needed to follow this tutorial and the final branch contains the completed code for the network.

# Hyperledger Composer Food Provenance Network Tutorial

Follow the instructions in this README to create your first Hyperledger Composer network.  

In this network, we are trying to solve the problem which Chipotle and many other restaurants face on a yearly basis.  Managing a restaurant supply chain from seed to sale is a complex process with many stakeholders involved.  A huge problem for restaurant chains like Chipotle is outbreaks of food-bourne illnesses, and even further, the problem of tracing the illness to the origin point.

According to U.S. Census data, Americans spent more at bars and restaurants ($54.8 billion) last year than on groceries ($52.5 billion) [1](https://www.foodsafetymagazine.com/enewsletter/food-safety-in-a-e2809cfoodiee2809d-culture-proactively-protecting-the-foodservice-supply-chain/).  With that kind of statistic, it makes sense that a large part of the restaurant industry is focused on the traceability of their food supplies.  In order to create a seed to sale audit trail, there needs to be internal tracking and external tracking within a supply chain.  What does this mean?  *Internal traceability* is primarily focused on the operations that are conducted within a link of the supply chain.  This includes all of the steps that a farmer takes from the moment of planting the seed of a crop to the moment that crop is harvested and placed into a ready-to-go shipping container.  *External* traceability is largely a matter of tracking a shipment between supply chain checkpoints via RFID, QR, or bar codes.

With this network, we will simulate what an end-to-end traceability network might look like for a company like Chipotle.  Although I have no affiliation to Chipotle, I have constructed a basic form of Chipotle's supply chain per [this case study](https://www.gs1.org/sites/default/files/docs/casestudies/Chipotle%20Mexican%20Grill.pdf).  

Suppliers of Chipotle follow a simple registration process, keep track of their own profiles, and provide GLNs (global location numbers) for each of their fields/distribution centers.  Suppliers may also supply information such as audits, codes of conduct, and insurance certificates.

In addition to profile data, Chipotle requires each supplier to emit CTEs (critical tracking events), which are function as *internal traceability* measures.  Events may include farmers packing cases, warehouse workers assigning these containers to pallets, and distributors dropping the pallets off at a Chipotle facility.

Furthermore, I have loosely followed a [Foodservice GS1 US Standards Initiative report](https://www.gs1us.org/DesktopModules/Bring2mind/DMX/Download.aspx?command=core_download&entryid=823&language=en-US&PortalId=0&Tabld=134?tum_source=2017PressReleases&utm_medium=PressRelease&utm_content=x&utm_campaign+FoundserviceIm) written by a traceability working group which provides a standard for tracing perishables through the supply chain.  This working group defines CTEs and KDEs (key data elements) as well as many of the standards to be followed such as GLNs (global location numbers), GTINs (global trade identification numbers), SSCCs (serial shipping container code), and more.

## Critical Tracking Events (CTEs)

*Note: the sale or financial transfer of ownership of a product is not a CTE*

There are three primary CTEs that should be followed; all of which have input events and output events: 

1. Transformation events - internal traceability events 

* Input - When one or more raw goods are used to create a traceable product (cutting, cooking, repackaging)
* Output - When the product is labeled and entered into the supply chain

*Note: All transformation events must share a unique identifier so inputs and outputs can be internally linked*

2. Transportation events - external traceability events 

* Input (Shipping) - when traceable product is dispatched from one location to another
* Output (Receiving) - when traceable product is received 

3. Depletion events - 

* Input (Consumption) - when traceable product becomes available to consumers (i.e. when a Chipotle employee opens a bulk container of Chicken to cook on the grill in the restaurant)
* Output (Disposal) - when a product is destroyed, discarded, or handled in a way that prevents consumers from consuming it (i.e. a Chipotle employee throws away an expired container of vegetables)  

## Key Data Elements (KDEs)

Closely tied to CTEs, KDEs represent the data that is emmitted when a CTE is conducted.  Although there are subtle nuances in the data between CTEs, generally, KDEs for each event will roughly include:

* Event Location - where the event occurs identified by GLN 
* Data Owner - the party who is observing the event and who should be contacted for more information about the event, identified by GLN (usually same as event location)
* Trading Partner - the recipient party of an event identified by GLN (only applicable to shipping/receiving events)
* Timestamp - for transformation events and depletion events that take an extended period of time, mark the end of the transformation or the beginning of the depletion 
* Activity type - one of the following
    * Purchase order
    * BOL (bill of lading)
    * ASN (advanced sales notice)
    * Production work order  
    * Served menu item 
* Activity Number - depending on the activity type, this could be anything from the product identifier in transformation events to the BOL receipt number
* Product GTIN 
* Batch/Lot Serial Number 
* Product Date 
    * Production date
    * Packaging date 
    * Best before / expiration date 
    * Sell by date
* Quantity 
* Unit of Measure 

# The Network

A Hyperledger consortium network is built with four types of resources: Participants, Assets, Transactions, and Events.  The participants define the organizations involved in the network, the assets represent the digital value we are transacting on the network, the transactions represent the actions that can be taken in the network, and the events represent alerts triggered by transactions.

## Participants 

### Suppliers

In our network, the suppliers will be those who participated in Chipotle's Pilot food tracking program, but note that Chipotle receives ingredients from hundreds of local produce, dairy, and meat farms which are 250 miles from a Chipotle distribution center.

1. [Golden State Foods](http://www.goldenstatefoods.com/)  (GLN - 0708112000009)
2. [Ed Miniat Inc.](https://www.miniat.com/) (GLN - 0081953000002)

Each supplier will have the following information: 

1. Supplier GLN 
2. Company Name
3. Address

### Chipotle Distribution Facility 

Chipotle has many different facilities, and therefore each facility will be represented as a distinct participant.

Each Chipotle distribution facility will have the following information: 

1. Facility GLN
2. Address

### Chipotle Restaurant

The chain restaurants serve the end product and therefore play a huge role in the supply chain.  In our network, the restaurant will now have insight into where their ingredients came from.

Each Chipotle restaurant will have the following information: 

1. Restaurant ID
2. Address

## Assets 

### Shipment 

Contains the following data: 

* Product GTIN 
* Batch/Lot Serial Number 
* Product Date
* Quantity 
* Unit of Measure

### Contract 

Contains the following data: 

* Event Location 
* Data Owner
* Trading Partner
* Timestamp
* Activity type
* Activity Number

## Transactions

Transactions are executed by specific members in the supply chain and therefore are permissioned.  In our Hyperledger network, certain transactions will be restricted/accessible to different participants:

* Bootstrap Network (admin) - will create a set of predefined participants to avoid manual entry 
* Create Contract (restaurant)
* Create Shipment (supplier)
* Ship Shipment (supplier or distributor)
* Receive Shipment (distributor or restaurant)
* Use Ingredients (restaurant)
* Dispose Ingredients (distributor or restaurant)

## Events 

Events will be triggered from the above transactions and will include the data mentioned in the CTE section above.

# Part 1 - Getting Setup

## Prerequisites 

* Node v8.0 or greater 
* Docker community edition 18.0 or greater 

## Creating workspace  

You will first need to clone this repository.  Navigate to your desired directory and run the following commands.

```
git clone https://github.com/zachgoll/hyperledger-composer-starter
cd hyperledger-composer-starter
npm install
docker-compose up 
```

This will get your environment ready for work. 

# Part 2 - Starting and Exploring Hyperledger Fabric 

To make our lives simple, there is a directory in this project called `fabric-tools/` which has prebuilt docker scripts to start Hyperledger Fabric.  Running a basic HL Fabric network requires four docker containers which include a peer, (`peer0.org1.example.com`), a certificate authority (`ca.org1.example.com`), a state database (`couchdb`), and an ordering service node (`orderer.example.com`).  Additionally, we can run a rest server and the composer playground in docker containers.

Please note that `package.json` has prebuilt npm scripts to do all of these manual steps, but for learning purposes, we will run the commands manually.

## 2.1 - Cleaning docker environment 

Many first time users of Hyperledger Composer have issues starting Fabric correctly because of existing Docker containers.  Assuming you have no important Docker containers running already, we can clean the environment with the following commands. 

```
docker kill $(docker ps -q)
docker rm $(docker ps -aq)
docker rmi $(docker images dev-* -q)
```

If you have Docker containers running that you do not want to destroy, then use the `docker container rm` command to manually remove containers.  After doing the above process, run the following. 

```
docker container ls
```

If everything is successful, no containers should be running.  Now, run the following command to download the necessary Docker images from Docker Hub.

```
fabric-tools/downloadFabric.sh
```

This script will fetch and download Docker images necessary to run Fabric.  For those unfamiliar with Docker, these images act as "containerized environments" and run as processes on your machine.  Although many liken a Docker image to that of a "mini virtual machine", it is really just another process running on the computer.

## 2.2 - Starting Hyperledger Fabric 

Run the following: 

```
fabric-tools/startFabric.sh 
```

This will use the Docker images you downloaded in the previous section and create instances of these images called "containers". 

Now, run the following command: 

```
docker container ls 
```

You should see: 

```
CONTAINER ID        IMAGE                                     COMMAND                  CREATED             STATUS              PORTS                                            NAMES
8051f2a1ce94        hyperledger/fabric-peer:x86_64-1.1.0      "peer node start"        4 minutes ago       Up 4 minutes        0.0.0.0:7051->7051/tcp, 0.0.0.0:7053->7053/tcp   peer0.org1.example.com
4dcfea4dd8cf        hyperledger/fabric-orderer:x86_64-1.1.0   "orderer"                4 minutes ago       Up 4 minutes        0.0.0.0:7050->7050/tcp                           orderer.example.com
a3eb39dce17f        hyperledger/fabric-ca:x86_64-1.1.0        "sh -c 'fabric-ca-se…"   4 minutes ago       Up 4 minutes        0.0.0.0:7054->7054/tcp                           ca.org1.example.com
4573661751fb        hyperledger/fabric-couchdb:x86_64-0.4.6   "tini -- /docker-ent…"   4 minutes ago       Up 4 minutes        4369/tcp, 9100/tcp, 0.0.0.0:5984->5984/tcp       couchdb
```

Let us dig in to each of these containers. 

### 2.2.1 - Peer Container 

The peer container represents a single node running in the HL Fabric network.  We can take a look inside running the following command. 

```
docker container exec -it peer0.org1.example.com bash 
```

This will put you into the bash shell of your peer container. You will now see something like this: 

```
root@8051f2a1ce94:/opt/gopath/src/github.com/hyperledger/fabric#
```

If you navigate through the file system as you would in a normal terminal, you will see that there is no relevant files or folders other than `composerchannel.block`.  If you run `cat composerchannel.block`, you will see that there are a bunch of binary, certificates, and other data.  When a peer joins a HL Fabric channel, this genesis block is used to synchronize with other peers in the channel and also to define the network as a whole.  This block was automatically generated for you when we started the HL Fabric.

We will come back to this container after deploying the Hyperledger Fabric network.  For now, you can leave the container by typing `exit` in the terminal.

### 2.2.2 - CouchDB 

The default state database for Hyperledger Fabric is CouchDB.  This was chosen because of CouchDB's ability to handle large amounts of data as well as its ability to maintain a history of state in a tree-like structure similar to many version control systems like Git. 

To see this container in action, open your browser and navigate to `http://localhost:5984/_utils`.  This will display a graphical interface called "Fauxton" which allows you to interact with CouchDB in the browser.  The only database unique to this network is the `composerchannel_` database.  Once we deploy the Composer network later in the tutorial, we will come back to this and see a few new databases that have been created. 

### 2.2.3 - Ordering Service Node 

This is the node which provides the "consensus mechanism" for the entire network.  This node is responsible for receiving transaction proposals, validating them, ordering them, and returning them in the correct order to all the peers in the network. 

### 2.2.4 - Certificate Authority Node 

This node is responsible for authenticating existing users of the network and issuing new identities.

## 2.3 - Creating an Administrator 

Run the following command 

```
composer card list 
```

At the moment, we do not have any identities present in our network.  In order to install and instantiate the smart contracts (chaincode) to the peer, we need to issue an administrative identity.  Again, we will use a pre-built script to do so.

```
fabric-tools/createPeerAdminCard.sh
```

This will create a new composer identity and store it at `~/.composer/cards` on a Mac.  You can check to see if this has been successfully created by running `composer card list` again from the terminal.  As you see, Hyperledger Composer manages identities with "cards".  This default administrator card has a username of `admin` and a secret key of `adminpw`.  We can use these credentials to install and deploy a new network. 

# Part 3 - Working with identities and the Composer CLI 

Before we start writing code, let's go through the tedious steps of installing and deploying a basic network.  This starter network already has code written so that we can go through the process of deploying.  We will delete the code and re-write it later.  

## 3.1 - The model file 

The model file is what defines the "schema" for our network.  In this file we will define participants, assets, transactions, and events that will be a part of the network.  If you take a look at it right now, you will see that there are just a few basic lines of code to get us started. 

## 3.2 - Permissions file 

The permissions file `permissions.acl` is located at the root of the project.  This file defines the permissions of different participants in the network.  Right now, the project does not have a permissions.acl file which means that all participants are equal.

## 3.3 - Smart contract file 

`lib/logic.js` is the file which defines how the participants and assets interact within the network.  Right now, there are no smart contracts written.

## 3.4 - Unit Testing file 

`test/logic.js` is the file we will use to test aspects of the network.  In this tutorial, I will not be writing many tests to save time, but will provide an introduction on setting the test file up.

## 3.5 - Let's deploy the network!

The above files are the four basic files in a business network.  You may add a `queries.qry` file as well, but I have left that out of the scope of this tutorial.  To deploy the network, the first step is creating the definition of the network for the HL Fabric to run.  To do this, run the following commands. 

```
mkdir dist 
composer archive create -t dir -n . -a ./dist/food-provenance.bna
```

*TIP: if you ever need a reference to the available commands from the Composer CLI, just run `composer -h` or `composer <command> -h`.*

In the above command, we have created the `food-provenance.bna` file and placed it in the `dist/` directory of our project.  The `-t dir` tells the CLI to generate the definition from an entire directory.  `-n .` tells the CLI that the directory it should build from is the current working directory.  Finally, the `-a ./dist/food-provenance.bna` tells the client to create the network definition in the `dist/` folder and call it `food-provenance.bna`.

Now that we have a network definition, we need to use this definition to install the chaincode to `peer0.org1.example.com`.  To do this, run the following command. 

```
composer network install -c PeerAdmin@hlfv1 -a ./dist/food-provenance.bna
```

In the above command, we are utilizing the administrator identity we created earlier to install the network definition (BNA file) to the peer.  `-c PeerAdmin@hlfv1` means that we are using the Composer card (again, you can see this by running `composer card list`) called `PeerAdmin@hlfv1`.  `hlfv1` is short for "Hyperledger Fabric Version 1" and is the default connection profile.  `-a ./dist/food-provenance.bna` is telling the CLI to install the `food-provenance.bna` network on the peers.

Next, we need to instantiate the chaincode on `peer0.org1.example.com`.  We do this with the following command. 

```
composer network start -n food-provenance -V 0.0.1 -A admin -S adminpw -c PeerAdmin@hlfv1 -f networkadmin.card
```

In the above command, we are telling the CLI to start version 0.0.1 of the food-provenance network via `-n food-provenance -V 0.0.1`.  `-A admin -S adminpw -c PeerAdmin@hlfv1` tells the CLI that we are starting the network with the administrator identity and that administrator has credentials of `admin` as a username and `adminpw` as a secret.  Finally, we are telling the CLI to issue an administrator identity to `PeerAdmin@hlfv1` and store this issued identity in `networkadmin.card`.  This will create the identity card and place it in the current working directory.

Now that we have started the network, let's go back to the `peer0.org1.example.com` Docker container.  Enter the bash shell with the command like before. 

```
docker container exec -it peer0.org1.example.com bash
```

While in the container, type the following command.

```
cd /
```
 
You will see that there is now "chaincode" installed on this peer!  Now exit the container by typing `exit`, and run: 

```
docker container ls 
```

You should see a brand new container called `dev-peer` which is the container where the chaincode will execute for `peer0.org1.example.com`.

# Part 4 - Defining the network participants, assets, transactions, and events

# Part 5 - Coding the smart contracts 

# Part 6 - Permissioning the network 

# Part 7 - Deploying the network to Hyperledger Fabric

# Part 8 - Interacting with the network 
