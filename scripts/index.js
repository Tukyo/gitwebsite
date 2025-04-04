var TitheDetails = [];
//Clothes
TitheDetails[1] = [4500, 4, 4500, 20, 4503, 40];
TitheDetails[2] = [4501, 4, 4501, 20, 4504, 40];
//Tools
TitheDetails[11] = [4540, 4, 4541, 8, 4542, 40];
//Furniture
TitheDetails[21] = [4520, 2, 4521, 10, 4522, 20];
//Bedding
TitheDetails[31] = [4580, 2, 4581, 2, 4582, 4];
//Jewelery
TitheDetails[41] = [4560, 3, 4561, 3, 4562, 3];

var KingdomTitheCost = [];

KingdomTitheCost[1] = [2, 11, 21];
KingdomTitheCost[2] = [1, 11, 21];
KingdomTitheCost[3] = [2, 11, 21];
KingdomTitheCost[4] = [2, 11, 21];
KingdomTitheCost[5] = [2, 11, 21];
KingdomTitheCost[6] = [2, 11, 21];
KingdomTitheCost[7] = [1, 11, 21];
KingdomTitheCost[8] = [2, 11, 21];
KingdomTitheCost[9] = [2, 11, 21];


KingdomTemp = [0, 90, 30, 60, 80, 60, 60, 50, 60, 60]

var SellAllCheck = false;

var provider;
var network;
var signer;
var cityContract
var cityContractSigner;
var merchantContract;
var merchantContractSigner;
var baseContract;
var baseContractSigner;
var productionContract;
var productionContractSigner;
var myAddress;
var cityData;

var buildingCount;

var selectedItem;
var lastRecipe;

async function welcome() {
    await address();
    provider = new ethers.providers.Web3Provider(window.ethereum)
    signer = await provider.getSigner();
    network = await provider.getNetwork();
    await signon();

    cityContract = new ethers.Contract(cityAddress, city_abi, provider);
    cityContractSigner = new ethers.Contract(cityAddress, city_abi, signer);
    baseContract = new ethers.Contract(baseAddress, base_abi, provider);
    baseContractSigner = new ethers.Contract(baseAddress, base_abi, signer);
    merchantContract = new ethers.Contract(merchantAddress, merchant_abi, provider);
    merchantContractSigner = new ethers.Contract(merchantAddress, merchant_abi, signer);
    productionContract = new ethers.Contract(productionAddress, production_abi, provider);
    productionContractSigner = new ethers.Contract(productionAddress, production_abi, signer);

    try { await signer.getAddress(); }
    catch (err) {
        ErrorToast.style.display = "block";
        ErrorText.style.display = "block";
        ErrorText.innerHTML = `ERROR: You do not currently have a wallet connected, please click "Connect Your Wallet Here" and refresh the page`;
    }
    myAddress = await signer.getAddress();
    cityData = await cityContract.getKingdomInfo(myAddress);
    console.log(cityData);

    buildingCount = await cityContract.getBuildingCount(myAddress);

    stockAmounts = await cityContract.getGeneralStockpile(myAddress);

    BuildingKingdomType.value = cityData.kingdomType

}

async function signon() {
    await provider.send("eth_requestAccounts", []);


    if (network.chainId !== 421614 && network.chainId !== 31337) {
        ErrorToast.style.display = "block";
        ErrorText.style.display = "block";
        ErrorText.innerHTML = "ERROR: You are connected to the wrong chain. Your current chain is " + network.chainId + ". Please change it to Arbitrum Sepolia, ID 421614";
    }
    else {

        ErrorText.style.display = "block";
        ErrorToast.style.display = "block";
        ErrorText.innerHTML = "Wallet Connected!";

        setTimeout(closeErrorText, 5000);
    }
}

function closeErrorText() {
    ErrorText.style.display = "none";
    ErrorToast.style.display = "none";
}

async function submitTX() {

    console.log("TXLogic in action")
    await TXLogic()/*
  try{await TXLogic()}
  catch (err) {
    console.log("error: " + err);
    console.log("ERROR DETECTED:");
    ErrorText.style.display = "block";
    ErrorToast.style.display = "block";
    ErrorText.innerHTML = "Error: " + err.data;
  }
  console.log("TXLogic Ran");*/
}
async function OnscreenTXConfirm() {

    var showToast = false;
    switch (actionSelect.value) {
        case "1":
            ErrorText.innerHTML = "Work successfully started!"
            showToast = true;
            break;
        case "2":
            ErrorText.innerHTML = "Crafting started!"
            showToast = true;
            break;
        case "3":
            ErrorText.innerHTML = "Transaction Confirmed!"
            showToast = true;
            break;
        case "4":
            ErrorText.innerHTML = "Building successfully built!"
            showToast = true;
            break;
        case "5":
            ErrorText.innerHTML = "Items successfully claimed!"
            showToast = true;
            break;
        case "6":
            ErrorText.innerHTML = "Land added!"
            showToast = true;
            break;
        case "7":
            ErrorText.innerHTML = "Civilian Goods Given!"
            showToast = true;
            break;
        case "9":
            ErrorText.innerHTML = "Medicine Added!"
            showToast = true;
            break;
        default:
            document.getElementById("ErrorText").style.display = "none"
            document.getElementById("ErrorToast").style.display = "none"
            break;
    }
    if (showToast == true) {
        document.getElementById("ErrorText").style.display = "block"
        document.getElementById("ErrorToast").style.display = "block"
    }
}

async function TXLogic() {

    console.log(cityData);
    var txWaiter = false;
    var tx = null;
    switch (actionSelect.value) {

        case "1":
            txWaiter = true;
            tx = await productionContractSigner.plant(
                LandMenu.value,
                document.getElementById("Amount").value,
                document.getElementById("cropSelect").value,
                Number(FertilizerSelector.value),
                document.getElementById("TimeAmount").value,
                Number(PopTypeSelector.value)
            );
            tx.wait().then(
                async (receipt) => {
                    console.log("Really worked", receipt);
                    OnscreenTXConfirm();
                }
            )
            break;

        case "2":
            console.log("Recipe: ", lastRecipe);
            let recipe = getRecipies(lastRecipe);
            if (BatchAmount.style.display == "none") {
                BatchAmount.value = Amount.value
                Amount.value = 1;
            }
            console.log(recipe.ingrediant);
            for (let i = 0; i < 8; ++i) {
                if (recipe.ingrediant[i] < 0) {
                    recipe.ingrediant[i] = document.querySelectorAll("Ingrediants")[(-1 * recipe.ingrediant[0])].value
                }
            }
            if (BatchAmount.value == 0 || Amount.value == 0) { Error("Amount is not valid"); }
            txWaiter = true;
            tx = await productionContractSigner.cook(
                lastRecipe,
                BatchAmount.value,
                recipe.ingrediant,
                [document.getElementById("CID").value, BuildingKingdomType.value - 1],
                Amount.value
            )
            break;

        case "3":
            var minTradePrice;
            var BuyorSell;
            minTradePrice = await calcTradeCost();
            if (BuyorSellID.value == "true") {
                minTradePrice *= 2;
                BuyorSell = true;
            }
            else {
                minTradePrice = Math.floor(minTradePrice / 2);
                BuyorSell = false;
            }
            txWaiter = true;

            const Trade = Number(document.getElementById("ItemMenuID").value)
            console.log("Trade:", Trade);
            tx = await merchantContractSigner.tradeItem(
                document.getElementById("ItemMenuID").value,
                document.getElementById("Amount").value,
                minTradePrice,
                BuyorSell
            )
            break;

        case "4":
            txWaiter = true;
            console.log("Building Value: ", CID.value);
            console.log("Building Sub Value: ", BuildingKingdomType.value);
            tx = await cityContractSigner.developCity(
                [document.getElementById("CID").value, BuildingKingdomType.value - 1],
                document.getElementById("Amount").value,
                LandMenu.value
            )
            break;
        case "5":
            txWaiter = true;
            var _landToClaim = Kingdom_Lands[cityData.kingdomType];
            for (let i = 0; i < 8; ++i) {
                console.log("Test " + i);
                console.log(_landToClaim);
                if (_landToClaim[i] == 0) { break; }
                var _timeToComplete = await cityContract.farmProgress(myAddress, i);
                var _completedTime = Number(_timeToComplete.time) + Number(_timeToComplete.worktime);
                console.log("Complete Time:", _completedTime);
                if (_completedTime < (Date.now() / 1000) && _completedTime != 0) {
                    tx = await productionContractSigner.claim(
                        _landToClaim[i]
                    )
                }
            }
            break;
        case "6":
            txWaiter = true;
            tx = await cityContractSigner.allocateLand(LandMenu.value, document.getElementById("Amount").value);
            break;
        case "7":
            txWaiter = true;
            tx = await cityContractSigner.payTithe(
                document.getElementById("CivGM").value,
                document.getElementById("Amount").value)
            break;
        case "9":
            txWaiter = true;
            tx = await cityContractSigner.treatIllness(
                [4200, 4201, 4202, 4203, 4204, 4205, 4206, 4207]
            )
            break;
        case "10":
            txWaiter = true;
            tx = await productionContractSigner.collect(document.getElementById("CID").value)
            break;
        case "11":
            break;

        case "13":
            txWaiter = true;
            tx = await baseContractSigner.safeTransferFrom(myAddress,
                document.getElementById("Address").value,
                document.getElementById("ItemMenuID").value,
                document.getElementById("Amount").value,
                "0x")
            break;
        default:
            console.log("Error: Invalid action selected in action select menu")
            break;
    }

    console.log("Test 5");
    if (txWaiter) {
        console.log("Waiting...");
        async (receipt) => {
            console.log("Claiming Really worked", receipt);
            OnscreenTXConfirm();
        }
    }


}

async function buildingCost(_value) {

    hideBuildingCost();

    if (actionSelect.value == "4" && CID.value != "200") {
        const building_info = eval("Building" + CID.value + "_" + BuildingKingdomType.value);
        const addyArray = [myAddress, myAddress, myAddress, myAddress, myAddress];
        const itemBal = await baseContract.balanceOfBatch(addyArray, building_info.reasourceType);
        console.log("building info", building_info);
        document.getElementById("B-Cost").style.display = "block";

        sendTX.style.display = "block";
        lackRecipeNotice.style.display = "none";
        for (let i = 0; i < 5; ++i) {
            document.getElementById("B-" + i).style.display = "block";
            document.getElementById("H-" + i).style.display = "block";
            if (i < 5) {
                document.getElementById("B-" + i).textContent = simpleDigit(building_info.reasourceAmount[i]) + " " + itemName(building_info.reasourceType[i])
                document.getElementById("H-" + i).textContent = "You have: " + itemBal[i];
                if (building_info.reasourceAmount[i] != 0 && building_info.reasourceAmount[i] > Number(itemBal[i])) {
                    sendTX.style.display = "none";
                    lackRecipeNotice.style.display = "block";
                    console.log("Insufficient Balance of", building_info.reasourceType[i], " Reasource Amount Needed:", building_info.reasourceAmount[i], "You Have: ", Number(itemBal[i]))
                }
            }
            if (building_info.reasourceType[i] == 0) {
                document.getElementById("B-" + i).style.display = "none";
                document.getElementById("H-" + i).style.display = "none";
            }
        }
        if (building_info.reasourceAmount[5] != 0) {
            document.getElementById("B-6").style.display = "block";
            document.getElementById("B-6").textContent = building_info.reasourceAmount[5] + " Land";
        }
        if (Number(BuildingKingdomType.value) != cityData.kingdomType) {
            document.getElementById("B-7").style.display = "block";
            document.getElementById("B-7").textContent = building_info.reasourceAmount[6] + " Building Permits";;
        }

    }
}
async function newBonusCalc(_mode, _baseproduction) {

    _consumerStockpiles = await cityContract.getStockedGoods(myAddress);


    var _season = await cityContract.returnSeason();
    const _kingdomTemp = seasonTemp(_season, KingdomTemp[cityData.kingdomType]);

    var _bonus = 0;
    var _happiness = -20;
    var _comfort = 0;
    var _productivity = 0;

    //375 is used as 150000 is the goal number,and 20 happiness is the ideal value, so (150000/20^2) = 375. 4x used for low noble and 40x for high noble.
    var _divisor = (150000 * (cityData.totalPopulation[0] + 4 * cityData.totalPopulation[1] + 40 * cityData.totalPopulation[2])) / 400;
    if (_divisor != 0) {
        _happiness += Math.floor(Math.sqrt(await (cityContract.getPlayerCityItems(myAddress).itemValue) / _divisor));
    }

    //Capped at a buff of 20 happiness
    if (_happiness > 20) { _happiness = 20; }

    if (_consumerStockpiles.lastMedicalTreatment != await cityContract.returnYear()) {
        _consumerStockpiles.medicalEffectiveness = 0;
    }

    _bonus += ((_consumerStockpiles.medicalEffectiveness));

    if (_mode != 5) {
        _happiness = (10 * (_consumerStockpiles.stockpileLevels[2])) + await _foodvaluecalc(Amount.value * BatchAmount.value);
        _productivity = (10 * (_consumerStockpiles.stockpileLevels[1])) + _baseproduction;
        _nutrition = await cityContract.getNutrition(myAddress);
        if (_nutrition[0] < 1500) { _happiness -= 10; }
        if (_nutrition[1] < 1500) { _productivity -= 10; }
        if (_nutrition[2] < 1500) { _productivity -= 10; }
        if (_nutrition[3] < 1500) { _happiness -= 10; }
        if (_nutrition[4] < 1500) { _comfort -= 10; }
    }
    if (_mode == 1) {
        var _infraBonus = 0;
        var _beautyBonus = 0;
        _buildingStats = await cityContract.getBuildingInfo(CID.value, BuildingKingdomType.value - 1);
        if (cityData.industrySize != 0) {
            _infraBonus = Math.floor((cityData.infraCount * 50) / cityData.industrySize);
            _beautyBonus = Math.floor((cityData.totalBeauty * 5) / (cityData.industrySize));
        }
        if (_infraBonus > 50) { _infraBonus = 50; }
        _productivity += _infraBonus + _buildingStats.buildingErgonommics;
        _happiness += _beautyBonus;
        _comfort += _buildingStats.buildingInsulation;
    }
    _comfort = ((10 * _consumerStockpiles.stockpileLevels[0] + 5 * _consumerStockpiles.stockpileLevels[2]));

    if (_kingdomTemp > (65 + _comfort)) {
        _bonus -= _mode * (_kingdomTemp - (65 + _comfort));
    }
    else if (_kingdomTemp < (65 - _comfort)) {
        _bonus -= _mode * ((65 - _comfort) - _kingdomTemp);
    }

    if (_mode != 5) {
        if (_happiness > _productivity) { _bonus += Math.floor(Math.floor(_happiness / 4) + Math.floor(_productivity * 3 / 4)); }
        else { _bonus += Math.floor(Math.floor(_happiness * 3 / 4) + Math.floor(_productivity / 4)); }
    }
    else { _bonus += 35; }
    _bonus += 65;
    if (_bonus < 5) { _bonus = 5; }
    return (_bonus);

}
async function _foodvaluecalc(_amount) {
    var _foodStockpiles = await cityContract.getGeneralStockpile(myAddress);
    console.log("Food Stockpiles", _foodStockpiles);
    var _foodValue = 0;
    var _drinkValue = 0;
    if (_foodStockpiles.foodItemCount >= _amount && _amount != 0) {
        _foodValuePer = (_foodStockpiles.foodItemValue / _foodStockpiles.foodItemCount);
        _foodValue = Math.floor(Math.sqrt(_foodValuePer * 20));
    }
    else {
        _foodValue = 0;
    }
    if (_foodStockpiles.drinkItemCount >= _amount && _amount != 0) {
        _drinkValuePer = (_foodStockpiles.drinkItemValue / _foodStockpiles.drinkItemCount);
        _drinkValue = Math.floor(Math.sqrt(_drinkValuePer * 20));
    }
    else { _drinkValue = 0; }


    if (_foodValue < _drinkValue) { _drinkValue = _foodValue; }

    return (_foodValue + _drinkValue);
}
function Stuff(_value) {

    showRecipe(_value);
    var whyJS;
    recipe = getRecipies(Number(document.getElementById("RecipeID").value));
    const _time = whyJS[5];
    hideTimedCraftingMenu();
    if (_time != 0) {
        showTimedCraftingMenu();
    }

    console.log(_recipe.ingrediant);
    if (_recipe.ingrediant[0] < 0) {
        showMultiItemMenu(_recipe.ingrediant[0], 0)
    }
    if (_recipe.ingrediant[1] < 0) {
        showMultiItemMenu(_recipe.ingrediant[1], 1)
    }
    console.log("showRecipe did run");

}

function simpleDigit(_value) {
    if (_value >= 10_000) { return ((_value / 1000) + "K") }
    else if (_value >= 10_000_000) { return ((_value / 1_000_000) + "M") }
}

function hideTimedCraftingMenu() {
    document.getElementsByClassName("CDInput")[0].style.display = "none";
    document.getElementsByClassName("CDInput")[1].style.display = "none";
    document.getElementsByClassName("CDInput")[2].style.display = "none";
}

function showRecipe(_value) {
    let recipe = getRecipies(Number(document.getElementById("RecipeID").value));
    var _recipeText;
    if (document.getElementById("Cost").textContent != "Cost: ") { document.getElementById("Cost").textContent = "Cost:" }
    for (let i = 0; i < 6; i++) {
        if (recipe.ingrediant[i] == 0) { break; }
        document.getElementById("Cost").textContent += (recipe.amount[i]);
        document.getElementById("Cost").textContent += " ";
        document.getElementById("Cost").textContent += itemName(recipe.ingrediant[i]);
        if (recipe.ingrediant[(i + 1)] != 0) {
            document.getElementById("Cost").textContent += ", ";
        }
    }
    document.getElementById("Cost").textContent += " For " + recipe.outputAmount[0] + " " + itemName(recipe.output[0]);

    if (recipe.output[1] != 0) {

        document.getElementById("Cost").textContent += " & " + recipe.outputAmount[1] + " " + itemName(recipe.output[1]);

    }
    if (recipe.output[2] != 0) {

        document.getElementById("Cost").textContent += " & " + recipe.outputAmount[2] + " " + itemName(recipe.output[2]);

    }

    document.getElementById("Cost").style.display = "block";
}

async function selectTask(_value) {
    hideAll();


    switch (_value) {

        case "1":


            document.getElementById("AmountID").style.display = "block";

            document.getElementById("FarmLabel").style.display = "block";
            document.getElementById("cropSelect").style.display = "block";
            document.getElementById("Farming").style.display = "block";

            document.getElementById("TimeAmountLabel").style.display = "block";
            document.getElementById("TimeAmount").style.display = "block";

            document.getElementById("LandAmountLabel").style.display = "block";
            break;
        case "2":

            document.getElementById("ItemMenu").style.display = "block";
            document.getElementById("ItemMenuSelector").style.display = "block";
            document.getElementById("ItemMenuSelectorLabel").style.display = "block";

            console.log("New Craft Run");
            break;
        case "3":
            showAmount();

            document.getElementById("ItemMenu").style.display = "block";
            document.getElementById("ItemMenuSelector").style.display = "block";
            document.getElementById("ItemMenuSelectorLabel").style.display = "block";
            document.getElementById("BuyorSellLabel").style.display = "block";
            document.getElementById("BuyorSellID").style.display = "block";
            document.getElementById("BuyorSell").style.display = "block";
            document.getElementById("totalCostID").style.display = "block";


            break;
        case "4":
            showAmount();

            document.getElementById("BuildingKingdomType").options[Number(cityData.kingdomType)].setAttribute('selected', true);

            document.getElementById("ItemMenu").style.display = "block";

            document.getElementById("CDInput").style.display = "block";
            document.getElementById("CDLabel").style.display = "inline";
            document.getElementById("CID").style.display = "inline";
            document.getElementById("totalCostID").style.display = "none";

            for (let i = 0; i < 28; i++) {
                document.getElementsByClassName("buildingSelector")[i].style.display = "initial";
            }
            break;
        case "5":
            FarmingNotice.style.display = "block";
            var _landToClaim = Kingdom_Lands[cityData.kingdomType];
            for (let i = 0; i < 8; ++i) {
                console.log("Test " + i);
                console.log(_landToClaim);
                if (_landToClaim[i] == 0) { break; }
                var _timeToComplete = await cityContract.farmProgress(myAddress, i);
                var _completedTime = Number(_timeToComplete.time) + Number(_timeToComplete.worktime);
                console.log("Complete Time:", _completedTime);
                if (_completedTime < (Date.now() / 1000) && _completedTime != 0 && _completedTime != 1) {
                    sendTX.disabled = false;
                    break;
                }
            }
            break;
        case "6":
            const housing = await kingdomHousingCheck();
            if (housing == true) {

                document.getElementById("landLabel").style.display = "inline";
                document.getElementById("landSelection").style.display = "block";
                document.getElementById("landAdderNotice").style.display = "block";
                document.getElementById("totalCostID").style.display = "none";
                showAmount();

                showLandMenu();
            }
            break;
        case "7":
            showAmount();

            document.getElementById("CivGoods").style.display = "block";
            document.getElementById("CivGM").style.display = "block";
            break;
        case "9":

            break;
        case "10":



            for (let i = 8; i < 32; ++i) {
                for (let j = 0; j < 9; ++j) {
                    if (buildingCount[j][i] != 0) {

                        ClaimButtonGrid.innerHTML = "";

                        var newDiv = document.createElement('button');
                        newDiv.id = "ClaimButton" + i;
                        newDiv.onclick = function () { productionContractSigner.collect(i, j) }

                        newDiv.innerHTML = getBuildingName(i);
                        ClaimButtonGrid.appendChild(newDiv);

                        newDiv.classList.add("ClaimButton");

                        var completionTime = await cityContract.craftProgress(myAddress, i, j);
                        console.log("Comp Time", completionTime);
                        for (let k = 0; k < 8; ++k) {
                            const _craftCompletionTime = Number(completionTime[k].timeWhenCompleted);
                            console.log("Craft Completion Time " + k, _craftCompletionTime);
                            if (_craftCompletionTime < (Date.now() / 1000) && _craftCompletionTime != 0) {
                                newDiv.style.background = "red";
                                newDiv.innerHTML += "\n Click To Claim";
                                console.log("3");
                                break;

                            }
                            //Uint64 max
                            else if (_craftCompletionTime >= (Date.now() / 1000) && _craftCompletionTime != 18446744073709551615) {
                                newDiv.style.background = "yellow";
                                const TTC = secondsToHMS(_craftCompletionTime - (Date.now() / 1000))
                                newDiv.innerHTML += "\nDone In: " + TTC;
                                console.log("2");
                                break;
                            }
                            else if (k == 7) {
                                newDiv.style.background = "yellowgreen";
                                newDiv.innerHTML += "\n Idle";
                                console.log("3");

                            }
                        }
                    }
                }
            }
            ClaimButtonGrid.style.display = "grid";
            break;
        case "11":
            console.log("Testsssir");
            var AllRecipies = itemID;
            var you_cubed = []
            for (let i = 0; i < AllRecipies.length; ++i) {
                you_cubed.push(myAddress);
            }
            const total_inventory = await baseContract.balanceOfBatch(you_cubed, AllRecipies);
            console.log(total_inventory);

            let thirdArray = [];

            let backupInv = [];

            let finalarray = [];

            let item_tracker = [];

            for (let i = 0; i < AllRecipies.length; ++i) {
                thirdArray.push([0, 0]);
                thirdArray[i][0] = (Number(total_inventory[i] * itemValue(AllRecipies[i])));
                //NaN check
                if (thirdArray[i][0] !== thirdArray[i][0]) { thirdArray[i][0] = total_inventory[i] }
                thirdArray[i][1] = AllRecipies[i];
                backupInv[i] = Number(total_inventory[i]) * itemValue(AllRecipies[i]);
            }
            backupInv.sort(function (a, b) { return b - a; });
            console.log("uhf", backupInv);

            for (let i = 0; i < AllRecipies.length; ++i) {

                for (let j = 0; j < AllRecipies.length; ++j) {
                    if (thirdArray[j][0] == backupInv[i]) {
                        if (item_tracker[j] == true) { break; }
                        if (backupInv[i] != 0) { finalarray.push([thirdArray[j][1], Number(total_inventory[j])]) }
                        item_tracker[j] = true;
                    }
                }
                if (backupInv[i][0] == 0) { break }
            }
            InventoryPanel.innerHTML = "";
            if (finalarray.length == 0) {
                const newDiv = document.createElement("InventorySubpanel0");
                InventoryPanel.appendChild(newDiv);
                newDiv.innerHTML = "You Currently Have No Items!";
                newDiv.classList.add("InventoryItem");
            }
            for (let i = 0; i < finalarray.length; ++i) {
                const newDiv = document.createElement("InventorySubpanel" + i);
                InventoryPanel.appendChild(newDiv);
                newDiv.innerHTML = itemName(finalarray[i][0]) + ": " + finalarray[i][1];

                if (i % 2 == 0) { newDiv.classList.add("InventoryItem") }
                else { newDiv.classList.add("InventoryItem2") }
            }
            InventoryPanel.style.display = "grid";
            InventoryPanel.style.gridTemplateRows = Math.ceil(finalarray.length / 3);
            console.log("Test Inventory Finished For", myAddress);
            break;
        case "13":
            showAmount();
            document.getElementById("ItemMenu").style.display = "block";
            document.getElementsByClassName("ItemMenu")[0].style.display = "block";
            document.getElementsByClassName("ItemMenu")[1].style.display = "block";
            document.getElementById("ItemMenuSelector").style.display = "block";
            document.getElementById("ItemMenuSelectorLabel").style.display = "block";
            document.getElementById("Amount").style.display = "block";
            document.getElementById("Address").style.display = "block";
            document.getElementById("AddressLabel").style.display = "block";
            break;
        default:
            console.log("Error: Invalid Task Selected")

    }
    document.getElementById("Amount").style.display = "block";

}

async function showLandMenu() {

    for (let i = 0; i < LandMenu.options.length; ++i) {
        if (LandMenu.options[i].classList.contains(cityData.kingdomType) == true || cityData.kingdomType == 0) { LandMenu.options[i].style.display = "block" }
        else if (typeof cityData.kingdomType !== "undefined") { LandMenu.options[i].style.display = "none" }
    }


    document.getElementById("landLabel").style.display = "inline";
    landSelection.style.display = "block";
}

function hideLandMenu() {

    document.getElementById("landLabel").style.display = "none";
    document.getElementById("landSelection").style.display = "none";
}

function hideInvalidBuildings(recipe) {

    console.log("Recipe: ", recipe);
    for (let i = 0; i < 31; i++) { document.getElementsByClassName("buildingSelector")[i].style.display = "none"; }
    for (let i = 0; i < 8; ++i) {
        if (recipe.allowableBuildings[i] != 200) {
            console.log("Building ID: ", recipe.allowableBuildings[i]);
            document.getElementsByClassName("buildingSelector")[recipe.allowableBuildings[i]].style.display = "initial";
        }
        else { break; }
    }


}

function hideBuildingCost() {
    document.getElementById("B-Cost").style.display = "none";
    for (let i = 0; i < 12; ++i) {
        document.getElementById("B-" + i).style.display = "none";
        document.getElementById("H-" + i).style.display = "none";
    }
}

async function totalCostCalc() {

    _value = selectedItem;
    document.getElementById("totalCost").style.display = "block";
    document.getElementById("totalCostID").style.display = "block";

    document.getElementById("totalCostID").textContent = "Total Cost:";
    document.getElementById("totalCostID").style.display = "block";
    if (actionSelect.value == "1") {
        hideFarmYield();
        setTTC(TimeAmount.value * 10);
        if (cropSelect.value > 100) { await farmYieldApproximator(); }
        else if (cropSelect.value == 1) { await landYieldApproximator(TimeAmount.value) }
        else if (cropSelect.value == 2) { document.getElementById("totalCostID").textContent = "Total Cost: " + (Amount * TimeAmount.value) + " Low Noble Hunting Ration. Will require " + (5 * Amount) + " land."; }
        else if (cropSelect.value == 3) { document.getElementById("totalCostID").textContent = "Total Cost: " + (Amount * TimeAmount.value) + " High Noble Hunting Ration. Will require " + (100 * Amount) + " land."; }
        PopTypeInput.style.display = "block";
    }
    else if (actionSelect.value == "2") {
        console.log("Value: ", _value);
        var recipe = getRecipies(_value);
        lastRecipe = _value;
        console.log("Recipe: ", recipe);

        document.getElementById("totalCostID").textContent = "Total Cost:";

        document.getElementById("CDInput").style.display = "block";
        document.getElementById("CDLabel").style.display = "inline";
        document.getElementById("CID").style.display = "inline";
        if (recipe.amount[0] != 0) {
            var _recipeText;
            var _foodcost;
            var _building;
            if (CID.value == 200) { _building = eval("Building200"); }
            else { _building = eval("Building" + CID.value + "_" + BuildingKingdomType.value); }
            hideInvalidBuildings(recipe);
            var _foodMultiplier = (Math.ceil((document.getElementById("BatchAmount").value * recipe.capacityUsed) / _building.industrySize));
            console.log(document.getElementById("BatchAmount").value, "a")
            _foodcost = _building.employees * (_foodMultiplier) * (recipe.timeToMake * Amount.value);
            var _outputText;
            _outputText = recipe.outputAmount[0] * Amount.value;
            if (recipe.timeToMake != 0) {
                console.log("is this running?");
                document.getElementById("BatchAmountLabel").textContent = "How many batches would you like to make? Max: ";
                document.getElementById("BatchAmountLabel").textContent += (_building.industrySize * buildingCount[Number(BuildingKingdomType.value) - 1][CID.value] / recipe.capacityUsed);
                //console.log("building read:", buildingCount[BuildingKingdomType.value + 1][CID.value]);
            }
            else {
                // Does this to account for no batches without more complex math
                document.getElementById("BatchAmount").value = 1;
            }
            for (var i = 0; i < 6; i++) {
                if (recipe.ingrediant[i] == 0) { break; }
                document.getElementById("totalCostID").textContent += " " + ((recipe.amount[i]) * Amount.value * document.getElementById("BatchAmount").value) + " " + itemName(recipe.ingrediant[i]);
            }
            if (recipe.timeToMake != 0) {
                document.getElementById("totalCostID").textContent += " & " + _foodcost + " Food";
            }
            document.getElementById("totalCostID").textContent += " For ";


            if (actionSelect.value == 2) { _outputText = _outputText * Number(document.getElementById("BatchAmount").value); }
            document.getElementById("totalCostID").textContent += (_outputText) + " " + itemName(recipe.output[0]);

            document.getElementById("totalCostID").style.display = "block";


            if (recipe.output[1] != 0) {
                document.getElementById("totalCostID").textContent += " & " + ((recipe.outputAmount[1]) * Amount.value * document.getElementById("BatchAmount").value) + " " + itemName(recipe.output[1]);
            }

            if (recipe.output[2] != 0) {
                document.getElementById("totalCostID").textContent += " & " + ((recipe.outputAmount[2]) * Amount.value * document.getElementById("BatchAmount").value) + " " + itemName(recipe.output[2]);
            }
            if (Amount.value != 0 && CID.value != "200") {
                sendTX.disabled = false;
            }
            else {
                sendTX.disabled = true;
            }
        }
        if (recipe.timeToMake == 0 || actionSelect.value == "7" ||
            actionSelect.value == "8" ||
            actionSelect.value == "4" ||
            actionSelect.value == "13" ||
            actionSelect.value == "3") {
            sendTX.disabled = false;
        }
        //Why is this here? Because I cant figure out how to make it work right in the if statement and its not worth the time to fix when this works
        else {
            if (document.getElementById("CID").value != 22) {
                console.log("Food Amounts:", stockAmounts);
                var _civ_bonus = await newBonusCalc(1, 0);
                console.log("Civ Bonus:", _civ_bonus);

                setTTC((Number(Amount.value) * recipe.timeToMake * 100) / (_civ_bonus));
            }
            else { setTTC(Number(Amount.value) * recipe.timeToMake); }
        }
    }
    else if (actionSelect.value == "3") {
        totalCostID.textContent = "Total Cost: ";
        var tradeCost = await calcTradeCost();
        totalCostID.textContent += tradeCost;
        totalCostID.textContent += " Coins";
        sendTX.disabled = false;
    }
    else if (actionSelect.value == "7") {

        let _popData = cityData[0];

        const _stockedGoods = await cityContract.getStockedGoods(myAddress);
        const _goods = _stockedGoods[1][CivGM.value];
        console.log((_goods + (Amount.value * 4)));
        if ((_goods + (Amount.value * 4)) > 25) { document.getElementById("totalCostID").textContent = "Error: You are trying to stock too many goods at once. The maximum amount your storage can currently handle is " + Math.floor((24 - _goods) / 4) }

        else {
            document.getElementById("totalCostID").textContent = "Total Cost:"
            for (let i = 0; i < 3; ++i) {
                document.getElementById("totalCostID").textContent += " " + (Amount.value * _popData[i] * TitheDetails[cityData.kingdomType][2 * i + 1]);
                document.getElementById("totalCostID").textContent += " " + itemName(TitheDetails[cityData.kingdomType][2 * i]);
                if (i != 2) { document.getElementById("totalCostID").textContent += " & " }

            }
        }
        sendTX.disabled = false
    }
    else {
        document.getElementById("totalCostID").style.display = "none";
        sendTX.disabled = false;
    }
}
function craftingMenu(_value) {
    hideAll();
    selectedItem = _value;
    totalCostCalc();
    showAmount();
    showBatchAmount();
}
function generateItemMenu(_value) {
    if (_value != ItemMenuID.value) {
        const _old_div_label = document.getElementById("ItemMenuIDLabel");
        const _old_div = document.getElementById("ItemMenuID");
        _old_div_label.remove();
        _old_div.remove();
        const _div_label = document.createElement("label");
        _div_label.id = ("ItemMenuIDLabel");
        const _div = document.createElement("select");
        _div.id = ("ItemMenuID");
        _div.classList.add("Dropdown");
        _div.addEventListener("change", function () {
            generateItemMenu(ItemMenuID.value);
            console.log("Test");
        })
        if (_value.charAt(0) == "[") { _value = eval(_value); }
        else { _value = [Number(_value)]; }
        console.log("Value: ", _value);
        var _recipe = [];
        for (let i = 0; i < _value.length; ++i) {
            _recipe[i] = (groupItems(_value[i]));
        }
        console.log("Recipe: ", _recipe);

        _div_label.innerHTML = "Which Item would you like to select?";
        for (let i = 0; i < _recipe.length; ++i) {
            for (let j = 0; j < _recipe[i].length; ++j) {

                const _child = document.createElement("option");
                _child.value = _recipe[i][j];
                _child.innerHTML = itemName(_recipe[i][j]);

                _div.appendChild(_child);
            }
        }

        itemMixSelection.appendChild(_div_label);
        itemMixSelection.appendChild(_div);
    }

    ItemMenuID.style.display = "block";
    ItemMenuIDLabel.style.display = "block";
    console.log("This also ran");

    if (actionSelect.value == "2") {
        console.log("This ran", ItemMenuID.value);


        const _recipieOptions = groupCrafting(ItemMenuID.value);

        console.log(_recipieOptions);
        document.getElementById("totalCost").style.display = "block";

        document.getElementById("BatchAmount").value = 1;
        Amount.value = 1;

        const _old_div = document.getElementById("totalCostID");
        _old_div.remove();
        const _div = document.createElement("div");
        _div.id = ("totalCostID");
        _div.innerHTML = "Recipies:<br>";
        for (let n = 0; n < 2; ++n) {

            //This breaks everything and IDK why,
            //if(n == 1){_div.innerHTML += "<br>Secondary Recipies: <br>"}
            for (let i = 0; i < _recipieOptions[n].length; ++i) {
                // Does this to account for no batches without more complex math
                if (_recipieOptions[n][i] == -1) { break; }
                var _recipe = getRecipies(_recipieOptions[n][i]);

                const _child = document.createElement("button");
                _child.id = ("craftingOption" + n + "-" + i);
                console.log(("craftingOption" + n + "-" + i));
                _child.value = _recipieOptions[n][i];

                _child.onclick = function () {
                    console.log("Craft Clicked!", _child.value);
                    selectedRecipe = _child.value;
                    craftingMenu(_child.value);
                }


                var _input = "Inputs: ";
                var _yields = "<br>Yields: ";
                for (let j = 0; j < 6; j++) {
                    if (_recipe.amount[j] != 0) { _input += (_recipe.amount[j] * Amount.value * document.getElementById("BatchAmount").value) + " " + itemName(_recipe.ingrediant[j]) + " "; }
                    if (_recipe.outputAmount[j] != 0) { _yields += (_recipe.outputAmount[j] * Amount.value * document.getElementById("BatchAmount").value) + " " + itemName(_recipe.output[j]) + " "; }
                }
                _child.innerHTML += _input + _yields;

                _child.innerHTML += "<br> Building Used: " + getBuildingName(_recipe.allowableBuildings[0])
                if (CraftingPreq[_recipe.allowableBuildings[0] + 1] != 200 && _recipe.allowableBuildings[0] != 200) { _child.innerHTML += " Or Higher"; }
                _child.innerHTML += "<br> Building Subtype: "
                var _allTrue = true;
                for (let j = 0; j < 9; ++j) {
                    if (_recipe.allowableBuildingTypes[j] == false) {
                        _allTrue = false;
                        break;
                    }
                }
                if (_allTrue == true) { _child.innerHTML += "No Limits" }
                else {
                    _child.innerHTML += "Valid Subtypes: "
                    var _trueCount = 0;
                    for (let j = 0; j < 9; ++j) {
                        if (_recipe.allowableBuildingTypes[j] == true) {
                            if (_trueCount != 0) { _child.innerHTML += ", " }
                            _child.innerHTML += kingdomName(j + 1);
                            _trueCount += 1;
                        }
                    }
                }
                _child.classList.add("CraftingOption");
                _div.appendChild(_child);
            }
        }
        _div.style.display = "block";

        totalCost.appendChild(_div);
    }
}
function showMultiItemMenu(_value, _inputValue) {

    const _old_div_label = document.getElementById("MultiMixItemLabel" + _inputValue);
    const _old_div = document.getElementById("MultiMixItem" + _inputValue);
    _old_div_label.remove();
    _old_div.remove();
    const _div_label = document.createElement("label");
    _div_label.id = ("MultiMixItemLabel" + _inputValue);
    const _div = document.createElement("select");
    _div.id = ("MultiMixItem" + _inputValue);
    _div.classList.add("Dropdown");

    console.log("Mix Value:", ("MultiMixItem" + _inputValue));
    const _recipe = getRecipies(_value);

    _div_label.innerHTML = "What Kind of Item would you like to use?";

    for (let i = 0; i < _recipe.length; ++i) {

        const _child = document.createElement("option");
        _child.value = _recipe[i];
        _child.innerHTML = itemName(_recipe[i]);

        _div.appendChild(_child);
    }

    itemMixSelection.appendChild(_div_label);
    itemMixSelection.appendChild(_div);

    _div.style.display = "block";
    _div_label.style.display = "block";
}

function setTTC(_time) {
    console.log("SetTTC is run");

    document.getElementById("timeToCompletion").style.display = "block";
    document.getElementById("Time").style.display = "block";
    const _new_Time = Math.trunc(Time_Multiplier * _time);
    console.log("New Time:", _new_Time)

    document.getElementById("timeToCompletion").textContent =
        "Time To Completion: " + secondsToHMS(_new_Time);

}

function secondsToHMS(_new_Time) {
    _new_Time = Math.trunc(_new_Time / 3600) + " Hours " + (Math.trunc(_new_Time / 60) % 60) + " Minutes " + Math.trunc(_new_Time % 60) + " Seconds ";
    return (_new_Time)
}

function sellAllCheck() {
    if (SellAllCheck == false) { SellAllCheck = true }
    else { SellAllCheck = false }
}

async function sellAll() {

    if (BuyorSellID.value && SellAllCheck == true) {
        var _item = await baseContract.balanceOf(myAddress, ItemMenuID.value);
        if (Number(itemValue(Number(ItemMenuID.value))) < 20) { _item = (Math.floor(_item / 100)); }
        Amount.value = _item;
        AmountID.style.display = "none";
        console.log("amount:", Amount.value);
        totalCostCalc();
        console.log(SellAllCheck);
    }
    else if (SellAllCheck == false) {
        AmountID.style.display = "block";
    }


}
async function calcTradeCost() {
    var marketSize = await merchantContract.returnMarketSize(Number(ItemMenuID.value));
    var TotalMarketSize = await merchantContract.returnMarketSizeMultiplier();
    var LandSold = await merchantContract.returnTotalLandSales();
    var ItemValue = itemValue(Number(ItemMenuID.value));
    console.log("Item Value: ", ItemValue);
    var marketFee = await merchantContract.returnMarketFee();
    var AmountSold = await merchantContract.returnAmountSold(Number(ItemMenuID.value));
    LandSold = Number(LandSold);
    AmountSold = Number(AmountSold);
    marketSize = Number(marketSize);
    marketFee = Number(marketFee);

    var tradeCost
    var tempAmountSold

    if (BuyorSellID.value == "true") {
        AmountSold += Math.floor(Number(Amount.value) / 2);
        console.log(AmountSold, "Amount Sold");
    }
    else {
        AmountSold -= Math.floor(Number(Amount.value) / 2);
        console.log(AmountSold, "e");
    }
    AmountSold = Math.abs(AmountSold);
    tempAmountSold = (10000 + Math.floor((AmountSold * ItemValue) / (marketSize * LandSold)));
    AmountSold = Math.floor((AmountSold * ItemValue * tempAmountSold) / TotalMarketSize);

    //*2 in here to balance it all
    if (BuyorSellID.value == "true") {
        AmountSold = Math.floor((AmountSold * 10000 * 2) / marketFee);
    }
    else {
        AmountSold = Math.floor((AmountSold * marketFee * 2) / 10000);
    }
    return (AmountSold)

}

function showRelevantCraftingRecipies(_value) {
    document.getElementById("RecipeMenus").style.display = "block";

    for (let i = 0; i < document.getElementById("RecipeID").options.length; ++i) {
        if (document.getElementById("RecipeID").options[i].classList.contains(_value) == true) { document.getElementById("RecipeID").options[i].style.display = "block" }
        else { document.getElementById("RecipeID").options[i].style.display = "none" }
    }
}

function setBuyString() {
    console.log(BuyorSellID.value)
}

function hideAll() {

    document.getElementById("LandAmountLabel").style.display = "none";
    document.getElementById("Amount").style.display = "none";
    document.getElementById("AmountLabel").style.display = "none";
    document.getElementById("TimeAmountLabel").style.display = "none";
    document.getElementById("TimeAmount").style.display = "none";
    document.getElementById("BatchAmount").style.display = "none";
    document.getElementById("BatchAmountLabel").style.display = "none";

    sendTX.disabled = true;
    document.getElementById("ClaimButtonGrid").style.display = "none";

    for (let i = 0; i < 3; ++i) {
        document.getElementById("MultiMixItem" + i).style.display = "none";
        document.getElementById("MultiMixItemLabel" + i).style.display = "none";

    }

    hideBuildingCost();
    noHousingNotice.style.display = "none";
    lackRecipeNotice.style.display = "none";
    FarmingNotice.style.display = "none";
    sendTX.style.display = "block";

    FertilizerSelector.style.display = "none";
    FertilizerMenu.style.display = "none";
    FertilizerBalance.style.display = "none";


    sellAllCheckbox.style.display = "none";
    sellAllText.style.display = "none";

    PopTypeInput.style.display = "none";

    document.getElementById("ErrorText").style.display = "none"
    document.getElementById("ErrorToast").style.display = "none"

    document.getElementById("totalCost").style.display = "none";
    document.getElementById("totalCostID").style.display = "none";

    document.getElementById("InventoryPanel").style.display = "none";

    document.getElementById("CropYieldAmount").style.display = "none";
    document.getElementById("SecondaryCropYieldAmount").style.display = "none";

    document.getElementById("Address").style.display = "none";
    document.getElementById("AddressLabel").style.display = "none";

    document.getElementById("ItemMenuSelector").style.display = "none";
    document.getElementById("ItemMenuSelectorLabel").style.display = "none";

    document.getElementById("landSelection").style.display = "none";

    document.getElementById("landAdderNotice").style.display = "none";

    document.getElementById("timeToCompletion").style.display = "none";
    document.getElementById("Time").style.display = "none";

    document.getElementById("totalCostID").style.display = "none";

    document.getElementById("Farming").style.display = "none";

    document.getElementById("itemBalance").style.display = "none";

    document.getElementById("RecipeMenus").style.display = "none";

    document.getElementById("Cost").style.display = "none";

    document.getElementById("CivGoods").style.display = "none";
    document.getElementById("CivGM").style.display = "none";

    document.getElementById("RecruitInput").style.display = "none";
    document.getElementById("RecruitSelector").style.display = "none";

    document.getElementById("CDInput").style.display = "none";
    document.getElementById("CID").style.display = "none";



    document.getElementById("BuyorSellID").style.display = "none";
    document.getElementById("BuyorSell").style.display = "none";
    hideAmount();
    document.getElementById("balance").style.display = "none";

    hideTimedCraftingMenu();
    document.getElementById("totalCostID").style.display = "none";
    document.getElementById("ItemMenuIDLabel").style.display = "none";
    document.getElementById("ItemMenuID").style.display = "none";

    document.getElementById("BuyorSellLabel").style.display = "none";

    for (let i = 0; i < document.getElementsByClassName("Population").length; i++) {
        document.getElementsByClassName("Population")[i].style.display = "none"
    }


}

async function kingdomHousingCheck() {

    _buildings = await cityContract.getBuildingCount(myAddress);
    console.log(_buildings);
    var _totalHousing = 0;
    var housingValid = true;
    for (let i = 0; i < 8; ++i) {
        _totalHousing += _buildings[i];
    }
    console.log("Housing Amount;", _totalHousing);
    if (_totalHousing == 0) {
        sendTX.style.display = "none";
        noHousingNotice.style.display = "block";
        housingValid = false;
    }
    return (housingValid)
}

function showAmount() {
    document.getElementById("Amount").style.display = "block";
    document.getElementById("AmountID").style.display = "block";
    document.getElementById("AmountLabel").style.display = "block";
}
function showBatchAmount() {
    document.getElementById("BatchAmountLabel").style.display = "block";
    document.getElementById("BatchAmount").style.display = "block";
}

function hideAmount() {
    document.getElementById("Amount").style.display = "none";
    document.getElementById("AmountID").style.display = "none";
    document.getElementById("AmountLabel").style.display = "none";
}

function hideFarmYield() {
    document.getElementById("CropYieldAmount").style.display = "none";
    document.getElementById("SecondaryCropYieldAmount").style.display = "none";
}

async function farmYieldApproximator() {

    const _availableLabor = cityData[1];

    const _cropInfo = farmData(cropSelect.value);

    const _landInfo = farmLandData(LandMenu.value);
    console.log("Food Amounts:", stockAmounts);

    var _currentTemp = _landInfo.temperature;

    var _season = await cityContract.returnSeason();

    _currentTemp = seasonTemp(_season, _currentTemp);

    if (!_cropInfo.isAnimal) {

        _soilQuality = _landInfo.soilQuality;
        //TODO: This can be ran locally, currently not because lazy
        _soilQuality += 5 * await cityContract.getItemLevel(FertilizerSelector.value);

        // Each degree off optimal decreases yield by 1%
        var _tempMultiplier = (((_currentTemp) - ((_cropInfo.temperature[2]))));
        _tempMultiplier = Math.abs(_tempMultiplier);
        _tempMultiplier = (100 - (_tempMultiplier));

        _yieldperland = Math.floor((((_soilQuality) + 100) * _tempMultiplier) / 100) - 100;
        console.log("Yield Per Land:", _yieldperland);
        //require(_landInfo.soilQuality != 0,"Should have soil Quality");
        //require (_soilQuality >= ((_cropInfo.minsoil)), "Land is too barren");

    }
    _yieldperland = await newBonusCalc(2, _yieldperland);
    if (_yieldperland <= 0) { console.log("ERROR: YOU ARE TO WEAK TO FARM THIS. MINIMUM 0. YOU HAVE:", _yieldperland); }

    //require ((_currentTemp) >= _cropInfo.temperature[0] && (_currentTemp) <= _cropInfo.temperature[1] , "Temprature too Hot/Cold");
    //require (_landInfo.waterQuantity >= _cropInfo.water[0] && _landInfo.waterQuantity <= _cropInfo.water[1], "Weather Too Wet/Dry");
    //require (_landInfo.altitude <= _cropInfo.maxheight, "Land is too high up");
    /*
    var temp_bonus = 100 - Math.abs((crop_info[2][2] - _temp_mod));
    console.log("Temp Bonus: ",temp_bonus);
    const fertility_bonus = (_land_info[3] + (5 * FertilizerLevel[FertilizerSelector.value]))
    const land_mod = ((temp_bonus * (100 + fertility_bonus))/100)-100;
    console.log("land mod",land_mod);
    const civ_good_bonus = await newBonusCalc(2,land_mod);
    console.log("civ goods: ",civ_good_bonus);
    var primary_yield = Math.round(TimeAmount.value * Amount.value * (crop_info[0] * civ_good_bonus)/100);
    */
    if (_cropInfo.secondaryOutput != 0) {
        document.getElementById("SecondaryCropYieldAmount").style.display = "block";
        document.getElementById("SecondaryCropYieldAmount").textContent = "Estimated Secondary Yield: ";

        primary_yield = (_cropInfo.yield * _yieldperland * Amount.value);
        var secondary_start = (_cropInfo.growthTime / 10)

        var secondary_yield_check = _cropInfo.secondaryOutput * (TimeAmount.value - secondary_start) * Amount.value * _yieldperland;
        if (secondary_yield_check < 0) { secondary_yield_check = 0 }
        if (_value * 10 - _cropInfo.growthTime < 0) { primary_yield = 0 }

        document.getElementById("SecondaryCropYieldAmount").textContent += secondary_yield_check + " " + itemName(_cropInfo.secondaryOutput);
    }

    document.getElementById("CropYieldAmount").style.display = "block";

    document.getElementById("totalCostID").textContent = "Total Cost: " + Amount.value * TimeAmount.value * 10 + " Food";


    var _finalValue = Math.floor(_cropInfo.yield * _yieldperland * Amount.value * TimeAmount.value / 100);
    document.getElementById("CropYieldAmount").textContent = "Estimated Primary Yield: " + _finalValue + " " + itemName(_cropInfo.output);

    var _selectedLand;
    for (let i = 0; i < 8; ++i) {
        if (Kingdom_Lands[cityData.kingdomType][i] == Number(LandMenu.value)) { _selectedLand = i }
    }
    _myLandArray = await cityContract.getLand(myAddress);
    console.log("My Land Array", _myLandArray)
    console.log("Amount:", Amount.value);
    console.log("Amount Of Selected Land:", _myLandArray[_selectedLand]);
    console.log("Crop Water: ", _landInfo.waterQuantity);
    console.log("Max Water: ", _cropInfo.water);
    if (Number(_availableLabor[0]) < Amount.value) {
        document.getElementById("CropYieldAmount").textContent = "You don't have enough people to do this! Max: " + _availableLabor[0];
        _finalValue = 0;
    }
    if (Number(_myLandArray[_selectedLand]) < Amount.value) {
        document.getElementById("CropYieldAmount").textContent = "You don't have enough land to do this! Max: " + _myLandArray[_selectedLand];
        _finalValue = 0;
    }
    else if (_landInfo.waterQuantity < _cropInfo.water[0]) {
        document.getElementById("CropYieldAmount").textContent = "Land is too dry to grow this";
        _finalValue = 0;
    }
    else if (_landInfo.waterQuantity > _cropInfo.water[1]) {
        document.getElementById("CropYieldAmount").textContent = "Land is too wet to grow this";
        _finalValue = 0;
    }
    else if (_cropInfo.maxHeight < _landInfo.altitude) {
        document.getElementById("CropYieldAmount").textContent = "Land is too high up for cultivation of this crop";
        _finalValue = 0;
    }
    else if (_cropInfo.minsoil > _soilQuality) {
        document.getElementById("CropYieldAmount").textContent = "Land is too barren up for cultivation of this crop";
        _finalValue = 0;
    }
    else if (_cropInfo.temperature[0] > _currentTemp) {
        document.getElementById("CropYieldAmount").textContent = "Land is too cold for cultivation";
        _finalValue = 0;
    }
    else if (_cropInfo.temperature[1] < _currentTemp) {
        document.getElementById("CropYieldAmount").textContent = "Land is too hot for cultication";
        _finalValue = 0;
    }
    else if (document.getElementById("TimeAmount").value > 25) {
        document.getElementById("CropYieldAmount").textContent = "This Is Too Long! Maximum number of repeats allowed is 25";
        _finalValue = 0;
    }
    if (_finalValue <= 0) { sendTX.disabled = true; }
    else { sendTX.disabled = false; }

}

async function balanceOfItem(_value) {

    const _item = await baseContract.balanceOf(myAddress, _value);
    console.log(_item);

    itemBalance.textContent = "Balance Of Item:" + _item;
    itemBalance.style.display = "block";
}

async function landYieldApproximator(_value) {

    const _wild_land_info = wildLandData(LandMenu.value);
    console.log(_wild_land_info);
    var temp_name = "Estimated Yield: ";

    const civilian_bonus = await newBonusCalc(2, 0);
    console.log(civilian_bonus);
    for (let i = 0; i < 5; ++i) {
        if (_wild_land_info[0][i] == 0) { break; }
        var _primaryYield = Math.floor((_wild_land_info[1][i] * _value * Amount.value * civilian_bonus) / 100);
        temp_name += _primaryYield + " " + itemName(_wild_land_info[0][i]);
        if (_wild_land_info[0][i + 1] == 0 || typeof (_wild_land_info[0][i + 1]) == "undefined") { break; }
        temp_name += " & ";

    }
    if (civilian_bonus <= 0) {
        sendTX.disabled = true;
    }
    else {
        sendTX.disabled = false;
    }

    document.getElementById("CropYieldAmount").style.display = "block";
    document.getElementById("totalCostID").textContent = "Total Cost: " + Amount.value * _value * 10 + " Food";



    if (document.getElementById("TimeAmount").value > 25) {
        document.getElementById("CropYieldAmount").textContent = "This Is Too Long! Maximum number of repeats allowed is 25";
    }
    else { document.getElementById("CropYieldAmount").textContent = temp_name }

}

function selectLand(_value) {

    document.getElementById("totalCost").style.display = "block";
    document.getElementById("totalCostID").style.display = "block";
    showLandMenu();
    if (_value > 500) {
        console.log("test");
        FertilizerSelector.style.display = "block";
        FertilizerMenu.style.display = "block";
    }
}


async function CivGoodStock() {
    CivGBalance.style.display = "block";
    CivGBalance.innerHTML = "Balance of Item:";

    const _itemRationType = TitheDetails[KingdomTitheCost[cityData.kingdomType][0]];
    console.log("Item Rations:", _itemRationType);
    var allItems = [_itemRationType[0], _itemRationType[2], _itemRationType[4]];
    var you_cubed = []
    for (let i = 0; i < allItems.length; ++i) {
        you_cubed.push(myAddress);
    }
    const total_inventory = await baseContract.balanceOfBatch(you_cubed, allItems);

    for (let i = 0; i < 3; ++i) {
        CivGBalance.innerHTML += itemName(allItems[i]) + ": " + total_inventory[i] + " "
    }
}

async function ShowFertilizer(_value) {

    const _item = await baseContract.balanceOf(myAddress, _value);

    FertilizerBalance.style.display = "block";
    FertilizerBalance.innerHTML = "You Have: " + _item;

}
async function cityDevHelper() {
    hideLandMenu();
    var _buildingAmount = await cityContract.getBuildingCount(myAddress);

    if (actionSelect.value == "4" && CID.value != "200") {
        var _Building = eval("Building" + document.getElementById("CID").value + "_" + document.getElementById("BuildingKingdomType").value);
        if (_Building.baseBuilding == 200) { showLandMenu(); }
    }
}