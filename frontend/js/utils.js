function showLoading() { $('#loading-overlay').css('display', 'flex'); }
function hideLoading() { $('#loading-overlay').hide(); }

async function loadAbi() {
    if (abi) return abi;
    const paths = ['abi.json', '../abi.json', '/abi.json'];
    for (const path of paths) {
        try {
            const response = await fetch(path);
            if (response.ok) {
                abi = await response.json();
                console.log("ABI loaded from " + path);
                return abi;
            }
        } catch (err) { }
    }
    alert("Could not load abi.json. Please ensure it is in the root directory.");
}

function truncateAddress(address) {
    return address.substring(0, 6) + '...' + address.substring(38);
}

function formatEth(wei) {
    return ethers.formatEther(wei);
}

function parseEth(eth) {
    return ethers.parseEther(eth.toString());
}
