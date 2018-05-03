swal.setDefaults({
	buttonsStyling: true,
	confirmButtonText: '<span class="icon-checkmark"></span> Ok',
	confirmButtonColor: '#5cb85c',
	cancelButtonText: '<span class="icon-cross"></span> Cancel',
	cancelButtonColor: '#d9534f',
});

let $headBlockNumber = document.getElementById('head-block-number');
let $reverseBlocksCount = document.getElementById('revers-blocks-count');
let $mainPage = document.getElementById('main-page');
let $recentBlocksTableTbody = document.getElementById('recent-blocks').getElementsByTagName('tbody')[0];
let $aboutBlockPage = document.getElementById('about-block-page');
let $aboutBlockCode = document.getElementById('about-block-code');
let $aboutBlockTableTbody = document.getElementById('about-block').getElementsByTagName('tbody')[0];
let $aboutBlockOperationsTableTbody = document.getElementById('about-block-operations-table').getElementsByTagName('tbody')[0];
let $aboutBlockTransactionsTableTbody = document.getElementById('about-block-transactions-table').getElementsByTagName('tbody')[0];
let $resetSearchBtn = document.getElementById('reset-search');
let $aboutAccountPage = document.getElementById('about-account-page');
let $aboutAccountTableTbody = document.getElementById('about-account').getElementsByTagName('tbody')[0];
let $aboutBlockHeight = document.getElementById('about-block-height');
let $aboutBlockTime = document.getElementById('about-block-time');
let $aboutBlockWitness = document.getElementById('about-block-witness');
let $aboutBlockTransactions = document.getElementById('about-block-transactions');
let $aboutBlockOperations = document.getElementById('about-block-operations');
let $loader = document.getElementsByClassName('lding')[0];
let $recentBlocksInfo = document.getElementById('recent-blocks-info');
let $resetNodeAddress = document.getElementById('reset-node-address');
let $globalPropertiesTableTbody = document.getElementById('global-properties').getElementsByTagName('tbody')[0];
let $chainPropertiesTableTbody = document.getElementById('chain-properties').getElementsByTagName('tbody')[0];
let $aboutAccountAllCount = document.getElementById('about-account-all-count');
let $aboutAccountCount = document.getElementById('about-account-count');
let $aboutAccountFilteredCount = document.getElementById('about-account-filtered-count');
let $autoClearRealTimeAfter = document.getElementById('auto-clear-real-time-after');
let $aboutAccountFilter = document.getElementById('about-account-filter');
let $modalAboutBlock = new Modal(document.getElementById('modal-about-block'));
let $modalAboutBlockModalTitle = document.getElementById('modal-about-block').querySelector('.modal-title');
let $modalAboutBlockOperationsTableTbody = document.getElementById('modal-about-block-operations-table').getElementsByTagName('tbody')[0];
let $modalAboutBlockTransactionsTableTbody = document.getElementById('modal-about-block-transactions-table').getElementsByTagName('tbody')[0];
let $modalAboutBlockCode = document.getElementById('modal-about-block-code');
let $aboutAccountPagePrev = document.getElementById('about-account-page-prev');
let $aboutAccountPageNext = document.getElementById('about-account-page-next');
let $nodeAddress = document.getElementById('node-address');
let $nodeAddressInput = $nodeAddress.querySelector('.form-control[name="node-address"]');
let $search = document.getElementById('search');
let $searchVal = $search.querySelector('.form-control[name="search"]');
let $blockchainVersion = document.getElementById('blockchain-version');
let $witnessesPage = document.getElementById('witnesses-page');
let $witnessesTableTbody = document.getElementById('witnesses-table').getElementsByTagName('tbody')[0];
let defaultWebsocket = 'wss://ws.golos.io';
let total_vesting_shares;

let getBlockchainVersion = function() {
	golos.api.getConfig(function(err, result) {
		if ( ! err) $blockchainVersion.innerHTML = result.STEEMIT_BLOCKCHAIN_VERSION;
	});
};

let getChainProperties = function() {
	golos.api.getChainProperties(function(err, properties) {
		if ( ! err) {
			for (let key in properties) {
				let prop = $chainPropertiesTableTbody.querySelector('b[data-prop="' + key + '"]');
				if (prop) prop.innerHTML = properties[key];
			}
		}
	});
};

$nodeAddress.addEventListener('submit', function(e) {
	e.preventDefault();
	localStorage.nodeAddress = $nodeAddressInput.value;
	window.location.reload();
});

if (localStorage && localStorage.nodeAddress) $nodeAddressInput.value = localStorage.nodeAddress;
$blockchainVersion.innerHTML = '...';
let nodeAddress = $nodeAddressInput.value;
golos.config.set('websocket', nodeAddress);
if (nodeAddress != defaultWebsocket) {
	$resetNodeAddress.style.display = 'block';
}
getBlockchainVersion();
getChainProperties();

$resetNodeAddress.addEventListener('click', function() {
	$nodeAddressInput.value = defaultWebsocket;
	$nodeAddressInput.dispatchEvent(new CustomEvent('submit'));
	$resetNodeAddress.style.display = 'none';
});

let workRealTime = true;
document.getElementById('change-work-real-time').addEventListener('click', function() {
	if (workRealTime) {
		workRealTime = false;
		this.innerHTML = '<span class="icon-play3"></span> Start monitoring';
		this.className = 'btn btn-success btn-sm float-right';
	}
	else {
		workRealTime = true;
		this.innerHTML = '<span class="icon-pause2"></span> Pause monitoring';
		this.className = 'btn btn-secondary btn-sm float-right';
	}
});

document.getElementById('clear-real-time').addEventListener('click', function() {
	$recentBlocksTableTbody.innerHTML = '';
	swal({title: 'Table real-time blocks cleared!', type: 'success', showConfirmButton: false, position: 'top-right', toast: true, timer: 3000});
});

golos.api.streamBlockNumber(function(err, lastBlock) {
	if ( ! err) {
		golos.api.getBlock(lastBlock, function(err, block) {
			if (block && workRealTime) {
				let operations = {};
				let operationsCount = 0;
				block.transactions.forEach(function(transaction) {
					transaction.operations.forEach(function(operation) {
						if ( ! operations[operation[0]]) operations[operation[0]] = 0;
						operations[operation[0]]++;
						operationsCount++;
					});
				});
				let operationsStr = '';
				for (let key in operations) {
					operationsStr += `<a class="btn btn-outline-info btn-sm" href="#operations/${lastBlock}/${key}">${key} <span class="badge badge-info">${operations[key]}</span></a> `;
				}
				let $newRow = $recentBlocksTableTbody.insertRow(0);
				$newRow.className = 'table-new';
				$newRow.innerHTML = `<tr>
										<td><a href="#block/${lastBlock}">${lastBlock}</a></td>
										<td>${block.timestamp}</td>
										<td><a href="#account/${block.witness}">${block.witness}</a></td>
										<td>${block.transactions.length}</td>
										<td>${operationsCount}</td>
									</tr>`;
				setTimeout(function() {
					$newRow.className = 'table-success';
				}, 500);
				setTimeout(function() {
					$newRow.className = 'table-secondary';
				}, 3000);
				let $newSubRow = $recentBlocksTableTbody.insertRow(1);
				$newSubRow.className = 'table-new';
				$newSubRow.innerHTML = `<tr>${operationsStr ? `<td colspan="5">${operationsStr}</td>` : ``}</tr>`;
				setTimeout(function() {
					$newSubRow.className = 'table-success';
				}, 500);
				setTimeout(function() {
					$newSubRow.className = '';
				}, 3000);
				autoClearRealTime();
			}
			else if (err) console.error(err);
		});
	}
	
	getDynamicGlobalPropertiesHandler();
	
});

let getDynamicGlobalPropertiesHandler = function() {
	golos.api.getDynamicGlobalProperties(function(err, properties) {
		if ( ! err) {
			total_vesting_shares = properties.total_vesting_shares;
			for (let key in properties) {
				let prop = $globalPropertiesTableTbody.querySelector('b[data-prop="' + key + '"]');
				if (prop) prop.innerHTML = properties[key];
			}
			let reverseBlockCount = properties.head_block_number - properties.last_irreversible_block_num;
			$headBlockNumber.innerHTML = properties.head_block_number;
			$reverseBlocksCount.innerHTML = reverseBlockCount;
		}
	});
}
getDynamicGlobalPropertiesHandler();

if (localStorage && localStorage.clearAfterBlocksVal) $autoClearRealTimeAfter.value = localStorage.clearAfterBlocksVal;

let autoClearRealTime = function() {
	let clearAfterBlocksVal = parseInt($autoClearRealTimeAfter.value),
		$trs = $recentBlocksTableTbody.getElementsByTagName('tr'),
		trsCount = $trs.length;
	localStorage.clearAfterBlocksVal = clearAfterBlocksVal;
	if (trsCount >= clearAfterBlocksVal * 2) {
		let removeCount = trsCount / 2 - clearAfterBlocksVal;
		for (let i = 0; i < removeCount; i++) {
			$recentBlocksTableTbody.removeChild($trs[trsCount - 1]);
			$recentBlocksTableTbody.removeChild($trs[trsCount - 2]);
			trsCount -= 2;
		}
	}
}

$autoClearRealTimeAfter.addEventListener('change', autoClearRealTime);

let getBlockFullInfo = function(blockNumberVal) {
	$aboutBlockTableTbody.innerHTML = '';
	$aboutBlockOperationsTableTbody.innerHTML = '';
	$aboutBlockTransactionsTableTbody.innerHTML = '';
	$aboutBlockCode.innerHTML = '';
	golos.api.getBlock(blockNumberVal, function(err, block) {
		loadingHide();
		if (block) {
			
			let operations = {};
			let operationsCount = 0;
			block.transactions.forEach(function(transaction) {
				transaction.operations.forEach(function(operation) {
					if ( ! operations[operation[0]]) operations[operation[0]] = 0;
					operations[operation[0]]++;
					operationsCount++;
				});
			});
			let operationsStr = '';
			for (let key in operations) {
				operationsStr += `<a class="btn btn-outline-secondary btn-sm">${key} <span class="badge badge-secondary">${operations[key]}</span></a> `; 
			}

			$aboutBlockHeight.innerHTML = blockNumberVal;
			$aboutBlockTime.innerHTML = block.timestamp;
			$aboutBlockWitness.innerHTML = `<a href="#account/${block.witness}">${block.witness}</a>`;
			$aboutBlockTransactions.innerHTML = block.transactions.length;
			$aboutBlockOperations.innerHTML = operationsCount;

			$newRow = $aboutBlockTableTbody.insertRow();
			$newRow.innerHTML = `<tr>
									<td colspan="5"><span class="badge badge-secondary"></span> ${operationsStr}</td>
								</tr>`;

			block.transactions.forEach(function(transaction) {
				transaction.operations.forEach(function(operation) {
					$newRow = $aboutBlockOperationsTableTbody.insertRow();
					$newRow.innerHTML = `<tr>
											<td rowspan="${Object.keys(operation[1]).length + 1}"><b>${operation[0]}</b></td>
										</tr>`;
					for (let keyOp in operation[1]) {
						operation[1][keyOp] = filterXSS(operation[1][keyOp]);
						$newRow = $aboutBlockOperationsTableTbody.insertRow();
						$newRow.innerHTML = `<tr>
												<td>${keyOp}</td>
												<td>${operation[1][keyOp]}</td>
											</tr>`;
					}
				});
				//
				for (let keyTr in transaction) {
					if (keyTr == 'operations') transaction[keyTr] = JSON.stringify(transaction[keyTr]);
					$newRow = $aboutBlockTransactionsTableTbody.insertRow();
					$newRow.innerHTML = `<tr>
											<td><b>${keyTr}</b></td>
											<td>${transaction[keyTr]}</td>
										</tr>`;
				}
				$newRow = $aboutBlockTransactionsTableTbody.insertRow();
				$newRow.className = 'table-active';
				$newRow.innerHTML = `<tr><td colspan="2">&nbsp;</td></tr>`;
			});
			
			let blockStr = JSON.stringify(block);
			blockStr = js_beautify(blockStr);
			$aboutBlockCode.innerHTML = blockStr;
			hljs.highlightBlock($aboutBlockCode);
		}
		else {
			if ( ! err) err = 'Block not found!';
			swal({title: 'Error', type: 'error', text: err});
		}
	});
}

$search.addEventListener('submit', function(e) {
	e.preventDefault();
	loadingShow();
	$resetSearchBtn.style.display = 'block';
	$mainPage.style.display = 'none';
	$aboutBlockPage.style.display = 'none';
	$aboutAccountPage.style.display = 'none';
	$recentBlocksInfo.style.display = 'none';
	$witnessesPage.style.display = 'none';
	let searchVal = $searchVal.value;
	// get HEX
	if (searchVal.length == 40) {
		//window.location.hash = 'tx/' + searchVal;
		$aboutBlockPage.style.display = 'block';
		golos.api.getTransaction(searchVal, function(err, result) {
			loadingHide();
			if ( ! err) {
				getBlockFullInfo(result.block_num);
			}
			else swal({title: 'Error', type: 'error', text: err});
		});
	}
	// get block
	else if (/^-?[0-9]+$/.test(searchVal)) {
		//window.location.hash = 'block/' + searchVal;
		$aboutBlockPage.style.display = 'block';
		getBlockFullInfo(searchVal);
	}
	// get account
	else {
		//window.location.hash = 'account/' + searchVal;
		$aboutAccountPage.style.display = 'block';
		getAccountTransactions();
	}
	return false;
});

$resetSearchBtn.addEventListener('click', function() {
	$searchVal.value = '';
	$resetSearchBtn.style.display = 'none';
	$mainPage.style.display = 'flex';
	$aboutBlockPage.style.display = 'none';
	$aboutAccountPage.style.display = 'none';
	$recentBlocksInfo.style.display = 'block';
	window.location.hash = '';
});

let loadingShow = function() {
	$loader.style.display = 'block';
};
let loadingHide = function() {
	$loader.style.display = 'none';
};

let accountHistoryFrom = -1;
let accountHistoryCount = 99;
let getAccountTransactions = function() {
	loadingShow();
	let usernameVal = $searchVal.value;
	let operationsCount = 0;
	$aboutAccountTableTbody.innerHTML = '';
	golos.api.getAccountHistory(usernameVal, accountHistoryFrom, accountHistoryCount, function(err, transactions) {
		loadingHide();
		if (transactions.length > 0) {
			//transactions.reverse();
			transactions.forEach(function(transaction) {
				if ( ! $aboutAccountFilter.value || (transaction[1].op[0] == $aboutAccountFilter.value)) {
					operationsCount++;
					let $newRow = $aboutAccountTableTbody.insertRow(0);
					$newRow.innerHTML = `<tr>
									<td>${transaction[1].timestamp}</td>
									<td><a href="#tx/${transaction[1].trx_id}">${transaction[1].trx_id}</a></td>
									<td>${transaction[1].op[1].from ? transaction[1].op[1].from : ''}</td>
									<td>${transaction[1].op[1].to ? transaction[1].op[1].to : ''}</td>
									<td>${transaction[1].op[1].amount ? transaction[1].op[1].amount : ''}</td>
									<td>${transaction[1].op[1].memo ? transaction[1].op[1].memo : ''}</td>
								</tr>`;
				}
			});
			if (transactions) {
				let transactionsCount = transactions.length;
				let transactionsAllCount = transactions[transactionsCount - 1][0];
				$aboutAccountAllCount.innerHTML = transactionsAllCount;
				$aboutAccountCount.innerHTML = transactionsCount;
				$aboutAccountFilteredCount.innerHTML = operationsCount;
				if (transactionsAllCount > transactionsCount) {
					// pagination
					let $newPage = `<li class="page-item"><a class="page-link" href="#">2</a></li>`;
				}
			}
			if (operationsCount == 0) swal({title: 'Error', type: 'error', text: `Not have ${$aboutAccountFilter.value} operations!`});
		}
		else {
			if ( ! err) err = 'Account not found!';
			swal({title: 'Error', type: 'error', text: err});
		}
	});
};

$aboutAccountPagePrev.addEventListener('click', function() {
	accountHistoryFrom -= 100;
	accountHistoryCount -= 100;
	getAccountTransactions();
});
$aboutAccountPageNext.addEventListener('click', function() {
	accountHistoryFrom += 100;
	accountHistoryCount += 100;
	getAccountTransactions();
});

$aboutAccountFilter.addEventListener('change', function() {
	let usernameVal = $searchVal.value;
	window.location.hash = `account/${usernameVal}/${$aboutAccountFilter.value}`;
	getAccountTransactions();
});

let getBlockInfo = function(blockNumberVal, operationName, callback) {
	loadingShow();
	$modalAboutBlockOperationsTableTbody.innerHTML = '';
	$modalAboutBlockTransactionsTableTbody.innerHTML = '';
	$modalAboutBlockCode.innerHTML = '';
	$modalAboutBlockModalTitle.innerHTML = `About block #${blockNumberVal}, filtered ${operationName}`;
	golos.api.getBlock(blockNumberVal, function(err, block) {
		loadingHide();
		if (block) {
			let blockTransactionsArr = [];

			block.transactions.forEach(function(transaction) {
				transaction.operations.forEach(function(operation) {
					if (operation[0] == operationName) {
						//console.log(transaction.operations);
						blockTransactionsArr.push(transaction);
						$newRow = $modalAboutBlockOperationsTableTbody.insertRow();
						$newRow.innerHTML = `<tr>
												<td rowspan="${Object.keys(operation[1]).length + 1}"><b>${operation[0]}</b></td>
											</tr>`;
						for (let keyOp in operation[1]) {
							$newRow = $modalAboutBlockOperationsTableTbody.insertRow();
							$newRow.innerHTML = `<tr>
													<td>${keyOp}</td>
													<td>${operation[1][keyOp]}</td>
												</tr>`;
						}

						for (let keyTr in transaction) {
							if (keyTr == 'operations') transaction[keyTr] = JSON.stringify(transaction[keyTr]);
							$newRow = $modalAboutBlockTransactionsTableTbody.insertRow();
							$newRow.innerHTML = `<tr>
													<td><b>${keyTr}</b></td>
													<td>${transaction[keyTr]}</td>
												</tr>`;
						}
						$newRow = $modalAboutBlockTransactionsTableTbody.insertRow();
						$newRow.className = 'table-active';
						$newRow.innerHTML = `<tr><td colspan="2">&nbsp;</td></tr>`;
					}
				});
			});
			
			block.transactions = blockTransactionsArr;
			let blockStr = JSON.stringify(block);
			blockStr = js_beautify(blockStr);
			$modalAboutBlockCode.innerHTML = blockStr;
			hljs.highlightBlock($modalAboutBlockCode);

			callback();
		}
		else {
			if ( ! err) err = 'Block not found!';
			swal({title: 'Error', type: 'error', text: err});
		}
	});
}

window.addEventListener('hashchange', function() {
	let hash = window.location.hash.substring(1);
	if (hash) {
		let params = hash.split('/');
		if (params[1]) {
			switch (params[0]) {
				case 'block': case 'tx': {
					$searchVal.value = params[1];
					$search.dispatchEvent(new CustomEvent('submit'));
				}; break;
				case 'account': {
					$searchVal.value = params[1];
					if (params[2]) $aboutAccountFilter.value = params[2];
					$search.dispatchEvent(new CustomEvent('submit'));
				}; break;
				case 'operations': {
					getBlockInfo(params[1], params[2], function() {
						$modalAboutBlock.show();
					});
				}; break;
			}
		}
		else {
			switch (params[0]) {
				case 'witnesses': {
					$searchVal.value = '';
					$resetSearchBtn.style.display = 'none';
					$mainPage.style.display = 'none';
					$aboutBlockPage.style.display = 'none';
					$aboutAccountPage.style.display = 'none';
					$witnessesPage.style.display = 'block';
					$witnessesTableTbody.innerHTML = '';
					golos.api.getWitnessesByVote('', 100, function(err, witnesses) {
						if ( ! err) {
							let witnessRank = 0;
							let accountsArr = [];
							witnesses.forEach(function(witness) {
								witnessRank++;
								accountsArr.push(witness.owner);
								let $newRow = $witnessesTableTbody.insertRow();
								const oneM = Math.pow(10, 6);
								const approval = formatDecimal(((witness.votes / oneM) / oneM).toFixed(), 0)[0];
								const percentage = (100 * (witness.votes / oneM / total_vesting_shares.split(' ')[0])).toFixed(2);
								const isWitnessesDeactive = /GLS1111111111111111111111111111111114T1Anm/.test(witness.signing_key);
								const noPriceFeed = /0.000 GOLOS/.test(witness.sbd_exchange_rate.base);
								if (isWitnessesDeactive || noPriceFeed) $newRow.className = 'table-danger';
								$newRow.innerHTML = `<tr>
												<td class="witness-rank">${witnessRank}</td>
												<td>
													<a target="_blank" href="#account/${witness.owner}"><img class="rounded float-left" data-username="${witness.owner}" src="https://golos.io/assets/0ee064e31a180b13aca01418634567a1.png"></a>
													<h3><a ${witnessRank < 20 ? ' style="font-weight: bold"' : ''} target="_blank" href="#account/${witness.owner}">${witness.owner}</a></h3>
													<a class="font-weight-light text-dark" target="_blank" href="${witness.url}">witness url</a>
												</td>
												<td><h5><span class="badge badge-light">${approval}M</span></h5></td>
												<td><h5><span class="badge badge-primary">${percentage}%</span></h5></td>
												<td><h5><span class="badge badge-light">${witness.total_missed}</span></h5></td>
												<td><h5><a class="badge badge-success" target="_blank" href="#block/${witness.last_confirmed_block_num}">${witness.last_confirmed_block_num}</a></h5></td>
												<td>
													${witness.sbd_exchange_rate.quote}
													<br>
													${witness.sbd_exchange_rate.base}
													<br>
													${witness.last_sbd_exchange_update}
												</td>
												<td>
													${witness.props.account_creation_fee}
													<br>
													${witness.props.sbd_interest_rate / 100}%
													<br>
													${witness.props.maximum_block_size}
												</td>
												<td><h5><span class="badge badge-info">${witness.running_version}</span></h5></td>
											</tr>`;
							});
							golos.api.getAccounts(accountsArr, function(err, accounts) {
								if ( ! err) {
									accounts.forEach(function(account) {
										try {
											let jsonMetadata = JSON.parse(account.json_metadata);
											if (jsonMetadata.profile && jsonMetadata.profile.profile_image) 
											$witnessesTableTbody.querySelector('img[data-username="' + account.name + '"]').src = jsonMetadata.profile.profile_image;
										}
										catch (e) {
											//console.error(e);
										}
									});
								}
							});
						}
						else {
							console.error(err);
							swal({title: 'Error', type: 'error', text: err});
						}
					});
				}; break;
			}
		}
	}
	else {
		$searchVal.value = '';
		$resetSearchBtn.style.display = 'none';
		$mainPage.style.display = 'flex';
		$aboutBlockPage.style.display = 'none';
		$aboutAccountPage.style.display = 'none';
		$witnessesPage.style.display = 'none';
		$recentBlocksInfo.style.display = 'block';
	}
});
window.dispatchEvent(new CustomEvent('hashchange'));

let fractional_part_len = function(value) {
	const parts = (Number(value) + '').split('.');
	return parts.length < 2 ? 0 : parts[1].length;
}
// https://github.com/steemit/condenser/blob/master/src/app/utils/ParsersAndFormatters.js#L8
let formatDecimal = function(value, decPlaces = 2, truncate0s = true) {
	let decSeparator, fl, i, j, sign, thouSeparator, abs_value;
	if (value === null || value === void 0 || isNaN(value)) {
		return 'NaN';
	}
	if (truncate0s) {
		fl = fractional_part_len(value);
		if (fl < 2) fl = 2;
		if (fl < decPlaces) decPlaces = fl;
	}
	decSeparator = '.';
	thouSeparator = ',';
	sign = value < 0 ? '-' : '';
	abs_value = Math.abs(value);
	i = parseInt(abs_value.toFixed(decPlaces), 10) + '';
	j = i.length;
	j = i.length > 3 ? j % 3 : 0;
	const decPart = decPlaces
		? decSeparator +
		Math.abs(abs_value - i)
			.toFixed(decPlaces)
			.slice(2)
		: '';
	return [
		sign +
			(j ? i.substr(0, j) + thouSeparator : '') +
			i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thouSeparator),
		decPart,
	];
}