async function connect() {
    if (window.ethereum) {
        showLoading();
        try {
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            signer = await browserProvider.getSigner();
            account = await signer.getAddress();

            contract = new ethers.Contract(contractAddress, abi, signer);

            $('#connect-btn').addClass('hidden');
            $('#account-info').removeClass('hidden');
            $('#account-address').text(truncateAddress(account));

            await Promise.all([
                loadCampaigns(),
                loadEvents()
            ]);
            setupEventListeners();
        } catch (err) {
            console.error("User denied account access", err);
        } finally {
            hideLoading();
        }
    } else {
        alert("Please install MetaMask!");
    }
}

async function loadCampaigns() {
    try {
        const count = await contract.count();
        const list = $('#campaign-list');
        list.empty();

        if (count == 0n) {
            list.append('<div class="col-span-full text-center py-20 text-gray-500 italic font-medium">No campaigns found yet... Start the first one!</div>');
            return;
        }

        for (let i = Number(count); i >= 1; i--) {
            const campaign = await contract.campaigns(i);
            const pledgedAmt = account ? await contract.pledgedAmount(i, account) : 0n;
            renderCampaign(i, campaign, pledgedAmt);
        }
    } catch (err) {
        console.error("Failed to load campaigns", err);
    }
}

async function loadEvents() {
    try {
        const events = await contract.queryFilter("*", -5000); // Last 5000 blocks
        const list = $('#event-list');
        list.empty();

        if (events.length === 0) {
            list.append('<div class="p-8 text-center text-gray-400 italic font-medium">No recent activity found.</div>');
            return;
        }

        // Sort descending by block number
        events.sort((a, b) => b.blockNumber - a.blockNumber);

        events.forEach(event => {
            renderEvent(event);
        });
    } catch (err) {
        console.error("Failed to load events", err);
        $('#event-list').html('<div class="p-8 text-center text-red-400 italic font-medium">Failed to load activity.</div>');
    }
}

function setupEventListeners() {
    if (!contract) return;
    // Remove existing listeners if any
    contract.removeAllListeners();

    contract.on("*", (event) => {
        console.log("New Event Received:", event);
        renderEvent(event, true);
        loadCampaigns();
    });
}
