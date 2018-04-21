/**
 * New script file
 */

/**
 * Sample transaction
 * @param {chainworks.foodprovenance.BootstrapNetwork} bootstrapNetwork
 * @transaction
 */
async function bootstrapNetwork(tx) {
    const factory = getFactory();
    const NS = 'chainworks.foodprovenance';

    // create supplier 1
    const supplier1 = factory.newResource(NS, 'Supplier', 'S001');
    supplier1.glnCode = '0708112000009';
    supplier1.address = 'GSF Chicago, Illinois, U.S.';
    supplier1.companyName = 'Golden State Foods';

    // create supplier 2
    const supplier2 = factory.newResource(NS, 'Supplier', 'S002');
    supplier2.glnCode = '0708112000009';
    supplier2.address = 'GSF Chicago, Illinois, U.S.';
    supplier2.companyName = 'Golden State Foods';

    const supplier3 = factory.newResource(NS, 'Supplier', 'S003');
    supplier3.glnCode = '0081953000002';
    supplier3.address = '16250 S. Vincennes Ave. South Holland, IL 60473';
    supplier3.companyName = 'Ed Miniat Inc.';

    // create Chipotle distributor 1
    const distributor1 = factory.newResource(NS, 'Distributor', 'D001');
    distributor1.glnCode = '0088393000303';
    distributor1.address = 'Chipotle Chicago Distribution Center';

    // create Chipotle restaurant 1
    const restaurant1 = factory.newResource(NS, 'Restaurant', 'R001');
    restaurant1.glnCode = '0088393000303';
    restaurant1.address = '525 W Monroe St L1A, Chicago, IL 60661, USA';

    // create Chipotle restaurant 2
    const restaurant2 = factory.newResource(NS, 'Restaurant', 'R002');
    restaurant2.glnCode = '0088393000303';
    restaurant2.address = '316 N Michigan Ave, Chicago, IL 60601, USA';

    // add the growers
    const growerRegistry = await getParticipantRegistry(NS + '.Supplier');
    await growerRegistry.addAll([supplier1, supplier2, supplier3]);

    // add the importers
    const importerRegistry = await getParticipantRegistry(NS + '.Distributor');
    await importerRegistry.addAll([distributor1]);

    // add the shippers
    const shipperRegistry = await getParticipantRegistry(NS + '.Restaurant');
    await shipperRegistry.addAll([restaurant1, restaurant2]);

}

/**
 * Sample transaction
 * @param {chainworks.foodprovenance.CreateContract} createContract
 * @transaction
 */
async function createContract(c) {
    const factory = getFactory();
    const NS = 'chainworks.foodprovenance';

    // create contract
    const contract = factory.newResource(NS, 'Contract', c.contractId);
    contract.supplier = c.supplier;
    contract.distributor = c.distributor;
    contract.restaurant = c.restaurant;
    contract.activity = c.activity;
    contract.activityNumber = c.activityNumber;

    // add the contract
    const contractRegistry = await getAssetRegistry(NS + '.Contract');
    await contractRegistry.addAll([contract]);
}

/**
 * Sample transaction
 * @param {chainworks.foodprovenance.CreateShipment} createShipment
 * @transaction
 */
async function createShipment(s) {
    const factory = getFactory();
    const NS = 'chainworks.foodprovenance';

    console.log(s);

    const dateInfo = factory.newConcept(NS, 'ProductDate');

    if (s.dateInfo.productionDate) {
        dateInfo.productionDate = s.dateInfo.productionDate;
    }

    if (s.dateInfo.packagingDate) {
        dateInfo.packagingDate = s.dateInfo.packagingDate;
    }

    if (s.dateInfo.expirationDate) {
        dateInfo.expirationDate = s.dateInfo.expirationDate;
    }

    if (s.dateInfo.sellByDate) {
        dateInfo.sellByDate = s.dateInfo.sellByDate;
    }

    console.log(dateInfo);

    const shipment = factory.newResource(NS, 'Shipment', s.gtin);
    shipment.contract = s.contract;
    shipment.dateInfo = dateInfo;
    shipment.lotSerial = s.lotSerial;
    shipment.quantity = s.quantity;
    shipment.unit = s.unit;
    shipment.status = 'CREATED';

    // add the shipment
    const shipmentRegistry = await getAssetRegistry(NS + '.Shipment');
    await shipmentRegistry.addAll([shipment]);

    let shipCreationEvent = factory.newEvent(NS, 'ShipmentCreated');
    shipCreationEvent.shipment = shipment;
    emit(shipCreationEvent);
}

/**
 * Sample transaction
 * @param {chainworks.foodprovenance.ShipShipment} shipShipment
 * @transaction
 */
async function shipShipment(s) {
    const factory = getFactory();
    const NS = 'chainworks.foodprovenance';

    const shipment = s.shipment;

    if (shipment.status !== 'USED' && shipment.status !== 'SHIPPED' && shipment.status !== 'DISPOSED') {
        shipment.status = 'SHIPPED';
    } else {
        throw new Error('Cannot ship an item that has been used, shipped, or disposed!');
    }

    // add the shipment
    const shipmentRegistry = await getAssetRegistry(NS + '.Shipment');
    await shipmentRegistry.update(shipment);
    let shipEvent = factory.newEvent(NS, 'ShipmentShipped');
    shipEvent.shipment = shipment;
    shipEvent.to = s.to;
    shipEvent.from = s.from;
    emit(shipEvent);
}

/**
 * Sample transaction
 * @param {chainworks.foodprovenance.ReceiveShipment} receiveShipment
 * @transaction
 */
async function receiveShipment(s) {
    const factory = getFactory();
    const NS = 'chainworks.foodprovenance';

    const shipment = s.shipment;
    if (shipment.status === 'SHIPPED') {
        shipment.status = 'RECEIVED';
    } else {
        throw new Error('Cannot receive a shipment that is not in transit!');
    }

    // add the shipment
    const shipmentRegistry = await getAssetRegistry(NS + '.Shipment');
    await shipmentRegistry.update(shipment);
    let shipEvent = factory.newEvent(NS, 'ShipmentReceived');
    shipEvent.shipment = shipment;
    emit(shipEvent);
}

/**
 * Sample transaction
 * @param {chainworks.foodprovenance.UseIngredients} useIngredients
 * @transaction
 */
async function useIngredients(s) {
    const factory = getFactory();
    const NS = 'chainworks.foodprovenance';

    const shipment = s.shipment;
    if (shipment.status !== 'DISPOSED' && shipment.status !== 'SHIPPED') {
        shipment.status = 'USED';
    } else {
        throw new Error('Cannot use ingredients that have been disposed or shipped!');
    }

    // add the shipment
    const shipmentRegistry = await getAssetRegistry(NS + '.Shipment');
    await shipmentRegistry.update(shipment);
    let ingredientEvent = factory.newEvent(NS, 'IngredientUsed');
    ingredientEvent.shipment = shipment;
    emit(ingredientEvent);
}


/**
 * Sample transaction
 * @param {chainworks.foodprovenance.DisposeIngredients} disposeIngredients
 * @transaction
 */
async function disposeIngredients(s) {
    const factory = getFactory();
    const NS = 'chainworks.foodprovenance';

    const shipment = s.shipment;
    if (shipment.status !== 'USED' && shipment.status !== 'SHIPPED') {
        shipment.status = 'DISPOSED';
    } else {
        throw new Error('Cannot dispose used or in transit ingredients!');
    }

    // add the shipment
    const shipmentRegistry = await getAssetRegistry(NS + '.Shipment');
    await shipmentRegistry.update(shipment);
    let ingredientEvent = factory.newEvent(NS, 'IngredientDisposed');
    ingredientEvent.shipment = shipment;
    emit(ingredientEvent);
}