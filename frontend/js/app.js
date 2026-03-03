async function init() {
    showLoading();
    await loadAbi();
    if (abi) {
        contract = new ethers.Contract(contractAddress, abi, provider);
        await Promise.all([
            loadCampaigns(),
            loadEvents()
        ]);
        setupEventListeners();
    }
    hideLoading();
}

// UI Event Listeners
$('#connect-btn').on('click', connect);

$('#refresh-btn').on('click', async () => {
    showLoading();
    await loadCampaigns();
    hideLoading();
});

$('#launch-btn').on('click', async () => {
    if (!account) return alert("Connect wallet first!");
    const goal = $('#goal').val();
    const startVal = $('#startAt').val();
    const endVal = $('#endAt').val();

    if (!goal || !startVal || !endVal) return alert("Please fill all fields!");

    const startAt = Math.floor(new Date(startVal).getTime() / 1000);
    const endAt = Math.floor(new Date(endVal).getTime() / 1000);
    const goalWei = parseEth(goal);

    showLoading();
    try {
        const tx = await contract.launch(goalWei, startAt, endAt);
        await tx.wait();
        $('#launch-modal').addClass('hidden');
        $('#goal, #startAt, #endAt').val('');
        alert("Campaign launched successfully!");
        await loadCampaigns();
    } catch (err) {
        console.error(err);
        alert("Failed to launch campaign.");
    } finally {
        hideLoading();
    }
});

function openPledgeModal(id) {
    $('#modal-title').text('Pledge ETH to Campaign #' + id);
    $('#pledge-amount').val('').removeClass('hidden').attr('placeholder', 'Amount in ETH');
    $('#modal-submit').text('Confirm Pledge').off('click').on('click', async () => {
        const amt = $('#pledge-amount').val();
        if (!amt) return;
        showLoading();
        try {
            const tx = await contract.pledge(id, { value: parseEth(amt) });
            await tx.wait();
            $('#modal').addClass('hidden');
            alert("Pledged successfully!");
            await loadCampaigns();
        } catch (err) {
            console.error(err);
            alert("Pledge failed.");
        } finally {
            hideLoading();
        }
    });
    $('#modal').removeClass('hidden');
}

function openUnpledgeModal(id, currentAmt) {
    $('#modal-title').text('Unpledge from Campaign #' + id);
    $('#pledge-amount').val(currentAmt).removeClass('hidden').attr('placeholder', 'Amount to withdraw in ETH');
    $('#modal-submit').text('Confirm Unpledge').off('click').on('click', async () => {
        const amt = $('#pledge-amount').val();
        if (!amt) return;
        showLoading();
        try {
            const tx = await contract.unpledge(id, parseEth(amt));
            await tx.wait();
            $('#modal').addClass('hidden');
            alert("Unpledged successfully!");
            await loadCampaigns();
        } catch (err) {
            console.error(err);
            alert("Unpledge failed.");
        } finally {
            hideLoading();
        }
    });
    $('#modal').removeClass('hidden');
}

async function cancelCampaign(id) {
    if (!confirm("Are you sure you want to cancel this campaign?")) return;
    showLoading();
    try {
        const tx = await contract.cancel(id);
        await tx.wait();
        alert("Campaign cancelled!");
        await loadCampaigns();
    } catch (err) {
        console.error(err);
    } finally {
        hideLoading();
    }
}

async function claimFunds(id) {
    showLoading();
    try {
        const tx = await contract.claim(id);
        await tx.wait();
        alert("Funds claimed successfully!");
        await loadCampaigns();
    } catch (err) {
        console.error(err);
    } finally {
        hideLoading();
    }
}

async function refundPledge(id) {
    showLoading();
    try {
        const tx = await contract.refund(id);
        await tx.wait();
        alert("Refunded successfully!");
        await loadCampaigns();
    } catch (err) {
        console.error(err);
    } finally {
        hideLoading();
    }
}

// Initialize
init();
