function renderCampaign(id, campaign, myPledge) {
    const now = Math.floor(Date.now() / 1000);
    const goalEth = formatEth(campaign.goal);
    const pledgedEth = formatEth(campaign.pledged);

    const progress = Number(campaign.goal) > 0 ?
        Math.min((Number(campaign.pledged) / Number(campaign.goal)) * 100, 100).toFixed(1) : 0;

    let status = 'Upcoming';
    let statusColor = 'bg-yellow-100 text-yellow-800';
    if (now >= Number(campaign.startAt) && now <= Number(campaign.endAt)) {
        status = 'Active';
        statusColor = 'bg-green-100 text-green-800';
    } else if (now > Number(campaign.endAt)) {
        status = 'Ended';
        statusColor = 'bg-red-100 text-red-800';
    }

    const startTime = new Date(Number(campaign.startAt) * 1000).toLocaleString();
    const endTime = new Date(Number(campaign.endAt) * 1000).toLocaleString();

    const card = `
        <div class="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden card-hover">
            <div class="p-6 flex-grow">
                <div class="flex justify-between items-start mb-4">
                    <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColor}">${status}</span>
                    <span class="text-xs font-mono text-gray-400">#${id}</span>
                </div>
                <p class="text-xs text-gray-500 mb-1">Creator: <span class="font-mono text-blue-500 font-medium">${campaign.creator.substring(0, 6)}...</span></p>
                
                <div class="mb-6">
                    <div class="flex justify-between items-baseline mb-2">
                        <span class="text-3xl font-extrabold text-gray-900">${pledgedEth} <span class="text-base font-semibold text-gray-400">ETH</span></span>
                        <span class="text-sm font-semibold text-gray-400">Goal: ${goalEth} ETH</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div class="bg-blue-600 h-full rounded-full transition-all duration-1000" style="width: ${progress}%"></div>
                    </div>
                    <div class="flex justify-between mt-2">
                        <p class="text-xs font-bold text-gray-400 uppercase tracking-tighter">Progress</p>
                        <p class="text-xs font-bold text-blue-600">${progress}% Funded</p>
                    </div>
                </div>

                <div class="space-y-3 bg-gray-50 p-4 rounded-2xl mb-4">
                    <div class="flex justify-between text-xs">
                        <span class="text-gray-500">Starts:</span>
                        <span class="font-semibold text-gray-900">${startTime}</span>
                    </div>
                    <div class="flex justify-between text-xs">
                        <span class="text-gray-500">Ends:</span>
                        <span class="font-semibold text-gray-900">${endTime}</span>
                    </div>
                </div>
            </div>

            <div class="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-3">
                ${renderButtons(id, campaign, now, myPledge)}
            </div>
        </div>
    `;
    $('#campaign-list').append(card);
}

function renderButtons(id, campaign, now, myPledge) {
    if (!account) return '<div class="col-span-2 text-center text-xs text-gray-400 py-2 italic font-bold">Connect wallet to interact</div>';

    let btns = '';
    const myPledgeEth = formatEth(myPledge);

    if (now >= Number(campaign.startAt) && now <= Number(campaign.endAt)) {
        btns += `<button onclick="openPledgeModal(${id})" class="col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95">Pledge</button>`;
        if (myPledge > 0n) {
            btns += `<button onclick="openUnpledgeModal(${id}, '${myPledgeEth}')" class="col-span-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 py-3 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95">Unpledge</button>`;
        }
    }

    if (now < Number(campaign.startAt) && campaign.creator.toLowerCase() === account.toLowerCase()) {
        btns += `<button onclick="cancelCampaign(${id})" class="col-span-2 bg-red-100 hover:bg-red-200 text-red-800 py-3 rounded-xl text-sm font-bold transition-all active:scale-95">Cancel Campaign</button>`;
    }

    if (now > Number(campaign.endAt) && campaign.creator.toLowerCase() === account.toLowerCase() && !campaign.claimed && campaign.pledged >= campaign.goal) {
        btns += `<button onclick="claimFunds(${id})" class="col-span-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-sm font-bold shadow-xl shadow-green-100 transition-all active:scale-95">Claim Funds</button>`;
    }

    if (now > Number(campaign.endAt) && myPledge > 0n && campaign.pledged < campaign.goal) {
        btns += `<button onclick="refundPledge(${id})" class="col-span-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-orange-100 transition-all active:scale-95">Refund (${myPledgeEth} ETH)</button>`;
    }

    if (btns === '') return '<div class="col-span-2 text-center text-xs text-gray-400 py-2 font-bold">Awaiting events...</div>';
    return btns;
}

function renderEvent(event, isNew = false) {
    const list = $('#event-list');
    if (list.find('.italic').length > 0) list.empty();

    let message = '';
    let icon = '';
    let color = '';

    const args = event.args;
    const name = event.fragment ? event.fragment.name : event.eventName;

    switch (name) {
        case 'Launch':
            icon = '🚀';
            color = 'blue';
            message = `Campaign #${args.id} launched by <span class="font-mono text-blue-500 hover:underline cursor-pointer">${args.creator.substring(0, 6)}...</span> with goal ${formatEth(args.goal)} ETH`;
            break;
        case 'Pledge':
            icon = '💰';
            color = 'green';
            message = `<span class="font-mono text-green-600 font-bold">${args.caller.substring(0, 6)}...</span> pledged ${formatEth(args.amount)} ETH to Campaign #${args.id}`;
            break;
        case 'Unpledge':
            icon = '📤';
            color = 'red';
            message = `<span class="font-mono text-red-500 font-bold">${args.caller.substring(0, 6)}...</span> unpledged ${formatEth(args.amount)} ETH from Campaign #${args.id}`;
            break;
        case 'Claim':
            icon = '🏁';
            color = 'purple';
            message = `Creator claimed funds for Campaign #${args.id}`;
            break;
        case 'Refund':
            icon = '↩️';
            color = 'orange';
            message = `<span class="font-mono text-orange-500 font-bold">${args.caller.substring(0, 6)}...</span> was refunded ${formatEth(args.amount)} ETH from Campaign #${args.id}`;
            break;
        case 'Cancel':
            icon = '❌';
            color = 'gray';
            message = `Campaign #${args.id} was cancelled`;
            break;
        default:
            return;
    }

    const html = `
        <div class="p-4 border-b border-gray-50 flex items-center space-x-4 hover:bg-gray-50 transition-all ${isNew ? 'bg-blue-50 animate-pulse' : ''}">
            <div class="w-10 h-10 rounded-full bg-${color}-100 flex items-center justify-center text-xl shadow-sm">
                ${icon}
            </div>
            <div class="flex-grow">
                <p class="text-sm text-gray-700">${message}</p>
                <p class="text-xs text-gray-400 mt-0.5">Block #${event.blockNumber}</p>
            </div>
        </div>
    `;

    if (isNew) {
        list.prepend(html);
        setTimeout(() => list.children().first().removeClass('bg-blue-50 animate-pulse'), 3000);
    } else {
        list.append(html);
    }
}
