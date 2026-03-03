// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

/**
 * @title CrowdFunding
 * @author Sonny Michael
 * @notice A decentralized crowdfunding application that allows users to create campaigns and pledge ETH.
 * @dev This contract handles campaign creation, pledging, unpledging, claiming funds, and refunds using native ETH.
 */
contract CrowdFunding {
    /**
     * @notice Emitted when a new campaign is launched.
     * @param id The unique identifier of the campaign.
     * @param creator The address of the campaign creator.
     * @param goal The funding goal in wei.
     * @param startAt The timestamp when the campaign starts.
     * @param endAt The timestamp when the campaign ends.
     */
    event Launch(
        uint256 id,
        address indexed creator,
        uint256 goal,
        uint32 startAt,
        uint32 endAt
    );

    /// @notice Emitted when a campaign is cancelled.
    event Cancel(uint256 id);

    /**
     * @notice Emitted when a user pledges ETH to a campaign.
     * @param id The unique identifier of the campaign.
     * @param caller The address of the pledger.
     * @param amount The amount of ETH pledged in wei.
     */
    event Pledge(uint256 indexed id, address indexed caller, uint256 amount);

    /**
     * @notice Emitted when a user unpledges ETH from a campaign.
     * @param id The unique identifier of the campaign.
     * @param caller The address of the pledger.
     * @param amount The amount of ETH unpledged in wei.
     */
    event UnPledge(uint256 indexed id, address indexed caller, uint256 amount);

    /// @notice Emitted when the creator claims the pledged funds.
    event Claim(uint256 id);

    /**
     * @notice Emitted when a user is refunded their pledge.
     * @param id The unique identifier of the campaign.
     * @param caller The address of the pledger receiving the refund.
     * @param amount The amount of ETH refunded in wei.
     */
    event Refund(uint256 id, address indexed caller, uint256 amount);

    struct Campaign {
        address creator;
        uint256 goal;
        uint256 pledged;
        uint32 startAt;
        uint32 endAt;
        bool claimed;
    }

    /// @notice Total number of campaigns created.
    uint256 public count;

    /// @notice Mapping from campaign ID to Campaign details.
    mapping(uint256 => Campaign) public campaigns;

    /// @notice Mapping from campaign ID to pledger address to amount pledged.
    mapping(uint256 => mapping(address => uint256)) public pledgedAmount;

    constructor() {}

    /**
     * @notice Launches a new crowdfunding campaign.
     * @param _goal The funding goal in wei.
     * @param _startAt The timestamp when the campaign begins.
     * @param _endAt The timestamp when the campaign concludes.
     */
    function launch(uint256 _goal, uint32 _startAt, uint32 _endAt) external {
        require(_endAt >= _startAt, "end at < start at");
        require(_endAt <= block.timestamp + 90 days, "end at > max duration");

        count += 1;
        campaigns[count] = Campaign({
            creator: msg.sender,
            goal: _goal,
            pledged: 0,
            startAt: _startAt,
            endAt: _endAt,
            claimed: false
        });

        emit Launch(count, msg.sender, _goal, _startAt, _endAt);
    }

    /**
     * @notice Cancels a campaign before it starts.
     * @param _id The unique identifier of the campaign.
     */
    function cancel(uint256 _id) external {
        Campaign memory campaign = campaigns[_id];
        require(campaign.creator == msg.sender, "not creator");
        require(block.timestamp < campaign.startAt, "started");

        delete campaigns[_id];
        emit Cancel(_id);
    }

    /**
     * @notice Pledges ETH to a specific campaign.
     * @dev The pledged amount is sent along with the call as msg.value.
     * @param _id The unique identifier of the campaign.
     */
    function pledge(uint256 _id) external payable {
        Campaign storage campaign = campaigns[_id];

        require(block.timestamp >= campaign.startAt, "not started");
        require(block.timestamp <= campaign.endAt, "ended");

        campaign.pledged += msg.value;
        pledgedAmount[_id][msg.sender] += msg.value;

        emit Pledge(_id, msg.sender, msg.value);
    }

    /**
     * @notice Withdraws a portion of the pledged ETH from a campaign.
     * @param _id The unique identifier of the campaign.
     * @param _amount The amount of ETH to unpledge in wei.
     */
    function unpledge(uint256 _id, uint256 _amount) external {
        require(
            pledgedAmount[_id][msg.sender] >= _amount,
            "insufficient pledge"
        );
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp <= campaign.endAt, "ended");

        campaign.pledged -= _amount;
        pledgedAmount[_id][msg.sender] -= _amount;

        (bool success, ) = payable(msg.sender).call{value: _amount}("");
        require(success, "Transfer failed");

        emit UnPledge(_id, msg.sender, _amount);
    }

    /**
     * @notice Allows the creator to claim the pledged funds if the goal is met.
     * @param _id The unique identifier of the campaign.
     */
    function claim(uint256 _id) external {
        Campaign storage campaign = campaigns[_id];
        require(campaign.creator == msg.sender, "not creator");
        require(campaign.pledged >= campaign.goal, "pledged < goal");
        require(!campaign.claimed, "claimed");

        campaign.claimed = true;
        uint256 amount = campaign.pledged;

        (bool success, ) = payable(campaign.creator).call{value: amount}("");
        require(success, "Transfer failed");

        emit Claim(_id);
    }

    /**
     * @notice Provides a refund to pledgers if the campaign fails to reach its goal.
     * @param _id The unique identifier of the campaign.
     */
    function refund(uint256 _id) external {
        Campaign memory campaign = campaigns[_id];
        require(block.timestamp > campaign.endAt, "not ended");
        require(campaign.pledged < campaign.goal, "pledged >= goal");

        uint256 bal = pledgedAmount[_id][msg.sender];
        pledgedAmount[_id][msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: bal}("");
        require(success, "Transfer failed");

        emit Refund(_id, msg.sender, bal);
    }
}
