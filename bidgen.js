var argv = require('yargs').argv;
var fs = require('fs');
var axios = require('axios');
var moment = require('moment');

var bidsonLand = new Map();
function process_bidgroup_into_landbids(input) {
	var landBidsDates = {};
	for (let i=0; i < input.length; i++) {
		let bidgroup = input[i];
		// ~console.log(Object.keys(bidgroup));
		for (let y=0; y < bidgroup.bids.length; y++) {
			let bid = bidgroup.bids[y];

			if (bidgroup.id < 7000 && clearAddress.includes(bid.address)) {
				continue;
			}

			let landid = bid.x+','+bid.y;

			let day = moment(bidgroup.receivedAt);
			if (day) {
				let bidDate = landBidsDates[ day.format("YYYY-MM-DD HH:mm") ];

				if (!bidDate) {
					bidDate = {};
					landBidsDates[ day.format("YYYY-MM-DD HH:mm") ] = bidDate;
				}

				if (!bidDate[landid]) {
					bidDate[landid] =	{
						x: bid.x,
						y: bid.y,
						bids: []
					};
				}

				let biddata = {
					'x': bid.x,
					'y': bid.y,
					'amount': bid.amount,
					'address': bid.address
				};
				bidDate[landid].bids.push(biddata);

				if (! bidsonLand.has(landid))
					bidsonLand.set(landid, []);

				bidsonLand.get(landid).push(biddata);

				if (bidgroup.id >= 7000 && clearAddress.includes(bid.address) && bidsonLand.get(landid).length > 1) {
					// ~console.log('Bid group:'+bidgroup.id+' Address:'+ bid.address +' Amount:'+ bid.amount + ' Land ID:'+ landid + ' Update Date'+ bidgroup.updatedAt + ' Land bids:'+ bidsonLand.get(landid).length);
				}
			}
		}
	}

	// ~console.log(JSON.stringify(landBidsDates));
	return JSON.stringify(landBidsDates);
}

module.exports = function( outputLocation, inputData ){
	if(!outputLocation) outputLocation = 'landbids.json';

	if(inputData) {
		fs.writeFileSync(outputLocation, process_bidgroup_into_landbids(inputData));
	} else {
		axios.get('https://api.auction.decentraland.org/api/bidGroup/')
			.then((res) => {
				fs.writeFileSync('bidgroups.json', JSON.stringify(res.data.data));

				fs.readFile('bidgroups.json', 'utf8', function (err,data) {
				  if (err) {
					 return console.log(err);
				  }
					fs.writeFileSync(outputLocation, process_bidgroup_into_landbids(JSON.parse(data)));
				});
			}
		);
	}
};

if (require.main === module) {
	module.exports(argv.size, argv.filename);
}

var clearAddress = ['0x15d777842cd7c8dcd9b88044ead8d9443e63e43a',
'0x47a02f835f1fbdfbe45341dee9aa0b8da86d6a4b',
'0xa7cbc96f399ebaba4c610465015d48cf10801ee0',
'0xd4f63b135069e31a340e4a54443c7179071cb190',
'0xe0a738aaa7d831196ece1fdfb35f088bcaa04dfb',
'0x633e8e94d6285c041aeec5689f86be73c8b542f9',
'0x2a9886f9f9f124f9efba5e1e6ac300ae8826886b',
'0x3be58c29b09669c1b1edd3153b0872e3cbcd8492',
'0x3e7aa069b179ceb803d2c63b32532d8936545caa',
'0xb63e4c61a5cc8a25341c7d9e4a1a737afbdfc02b',
'0xc7bb4eea2d6b28a4598bf55a2490443906d8b6bf',
'0x5085da488c770920273e497466b692d4547c774d',
'0x2bc89c638ba24ebb2dbef07bebc81ba3e8c10b92',
'0x1763e1533c91adeafa15a0f9e3051bb1257a48bf',
'0xb678d68efca1edee7421710edb4d3c9618b03ee7',
'0xe47ec7646adb8e2264bbb69c8364c70c5f9276ce',
'0x7bb0ab3d0525b0cdc83c26e988a5a820be095d5f',
'0x4a5c04e65a86b49c9783a1e6ad795d0e8fdaeb6b',
'0xbd34be474b40267b54c85ec80b9138d388e7891a',
'0x11a9936ee5711755127de27fb65bf57f4a2ced75',
'0x26f457046055190570cac1e2fc54cfdba0144488',
'0x2cf674dca312cc2f906b9376f0d720e5d030d464',
'0x17963388d8289ee2fde89abeecd4494eb3d67157',
'0x942dea287cc669f946f38283c788ecab5663f6a4',
'0xb3b3b3ba6335b819fc7db5ce01f4a4cdd270f23c',
'0xa49f0baa20263915f422b1ed4f1afe6068290968',
'0xcedcca358d63cb33b5fe6a34b98ffed71e60409e',
'0xf95287de72448e7b0e7fe4d824fc94c1c5e5333c',
'0x93ed601631407d91451ae010f68af381ea6d558c',
'0xcda081fdb9b1874ff9eee15ec94a60bb7dd465dc',
'0x7b28c2d2654936d1ef9fb5e375ce279a2b473ed0',
'0xcecbe670c11d4d28678955f23e0d2d708d79c893',
'0x33ca82e7474fd079be49e145ae9cc294ae439276',
'0x14deaef4686c85694fce2f4f2b3e4e84046caa61',
'0x95b53728508944bb10b097c6a87edcb3a41ec75f',
'0x070c5c8ee75f805212b0b860a21a9ac3cd1f2cba',
'0xebabcade58aecdeec21bf68e300a3885e5910fee',
'0x1e16fc9547a3f927a08d45367d4733ba1f1322b4',
'0xabe857f0b158f78f07a5d562ebc7ed58a9311522',
'0x070f7a6b2882ddea1c1dd674526753d3f2dfad11',
'0x34ffbc63e8af1f5262f964c89749ca4a34186469',
'0x6cdbf40df984913ad01cd6a06160637462786c04',
'0xa5104403c7461a550aed305487ff16427fcedd3f',
'0x8ae5d0fcf0c171700a8a782374a5a3f3c8013204',
'0x23af5cd4e2ed2fe272515ce0afcdd5f74c7fc845',
'0xc8a3390a5d34691582a3d52e6b1bcd3d64ec405e',
'0x96c8be2cb6742b0b1fad8adb166cf16807198cf6',
'0x0454598fc45e817a4be5f52bcd8c3c1f25ca3c46',
'0xe43c020d9729811c31e76f1b5b61ddab590eb2dc',
'0x776d69fb04e005f106074d981ccbe6008d7556cf',
'0x866afdb7f9201ccc93c102a66fc7e1ccde2b8d47',
'0x3632eba80749a7be8c434ed9fa13dd2c4c36f722',
'0xfe7ae4603cd6fc0c1245c45f80edab4f0ec0d99b',
'0xc32126f08a9580d3c0a53b30fcbec531d9426211',
'0x89f1757e9f7c4e7975fbe240aa043b426f0bdf2c',
'0x27a1eedb2f1e6a01331325086ba834a9814220af',
'0xf8e72f0e6f8f47ac22435b9d1b1772ce25adba0e',
'0x4ec75030e740628851574bf81253ca2adc81582e',
'0x67e8fc59fa772928e1b0b79934a9998b684aaf25',
'0xeaf93a7fd1767eca4726b715524897aaeb5d14ee',
'0x3137acc88dd785cd7b8113bdf0e7aa0e4a3c1bda',
'0x27361e2b4437ba3033d23048811035bfd39d27cf',
'0xcefe57a6d77d24c75b1ba883d8bcaf62d8dd38b6',
'0x794564c19c34994fbe02d65d66ea02db70d0e074',
'0x6deb3e840307b093fe44b4dbc069c2ab6de58657',
'0x94d9e1be7d33a1b0baeb410bb10380f68935b493',
'0x59ac135f2fae27ce736bc58bcd2e9f7a635c7aa6',
'0x1fe106203470c3d5a8f9e10dab7ac649677c0179',
'0xda28f5a46cd320b890d95991ef8bafed1697844a',
'0x19633bc17e4d918c875087fa7543fd027fc3a1be',
'0x174daef1b7a32439f43ab0721ce53151f7fb6508',
'0xaebb23493e64a06c7fcb884cb1dbeab5fa6c84b5',
'0x2e8c031326adb555c3532510de3297c143e56839',
'0x2bbbb53a27fbdb1acfb8fa541222edc06a8a9e79',
'0x27ace2849d6e1be10a3f0274d279c7788646b55e',
'0x7d893f9d38676fcead5b7d26d8763279c999fb95',
'0x6cd33d7653d8bcc657640c7e06be8602bd7b2266',
'0x263198c9fd4d8559c63ce69d0af7f57e11e32e8b',
'0xc3a23c412acf5b98cd62e10c8efcd1abe1593cb4',
'0xbed592cb0883e77e1a8394fa3c02159cfd08f5fc',
'0x076e89fe9e24c191ebee53cceec5356600c8d059',
'0x685fbb8985e4a485070b2d080c2591a033ea4cc0',
'0x4bb345545fce593b68aaba02985f2d9266dccfa5',
'0x2138ebda90a45ea5e681afe35a6052c6c2cd6d10',
'0xa14df28d307cfc91aeb3f22aa30aae1a69c68247',
'0x3b019d6b90b628da451dcc03f480ae3c3f035450',
'0xa2bee945978cb94124bbf3de87e30a33bc8d7b0d',
'0x8f8b8c20385356cdeead35eacf30c3e866bafcf0',
'0x01a35017c1475e9c4daa88771ee5bc9ee427c28f',
'0x734b17637d688da2503d607eb430707bb8983329',
'0xb2a79f1bc0fd5daa7422ade0a4143a21b36918f6',
'0xb096e691b197e4622bc0033a2efda76082b33783',
'0x1c2c251d14fca1a9118440a15a8305220efaa16a',
'0x88809bf2405edd716537a78d103d75ebe3588133',
'0x0ce1203406c44aad388b2ceaee5261cee10dcd33',
'0x1d2ab9a4093469a9a02cace4e9e071a04fa41886',
'0x795c496f8a78ceacd7b09fe41c788bbbff08343c',
'0xeaebb43d47ab98fe8c0bdc4c4bb68bf0f6e7ad2d',
'0xc3a2f704886c98b4afd49944425e1c6bbd2b4b69',
'0xbca76b7aaec3d6f38b16dc84f0ccb0f6398f9702',
'0x2a407492f6eec72000bbf5564212de937dee7551',
'0x3741a269b9b8a7a5d4052a5a51fa47fd8a0911ef',
'0xfa309f2e2a872d8c64165f685948847f2ac76ea8',
'0xf53150917e17f5f618573380e7ca57bd6c3fd81a',
'0x48ff2baac9c63cdb6bad279bc219c4530429d0fc',
'0x5cca51528705eb18edcf083e122eb3e6b38c76d6',
'0x6e061af31d8680540af34bac0a078a1be06aeeb6',
'0x0b2698281c97900f10c23e71653e9a46aecaff8d',
'0x21b150efad83528ba5aab434c57cb340f0d3d490',
'0x5d46101f48ca4e7a193b062be654559a2e817040',
'0x2d2440260b155cd7dbe38414b42e2d5d493a31b0',
'0x57b6d3ccfd21a83c1f274c7c0975f70e58834259',
'0x6f02fa832271a96011113edad9f7e2b629f70151',
'0xa22dfb8fe3c05857816ab3601db4b6e0ac56fe73',
'0x606584179d109340ee5522cfbf8a8084d300d9c3',
'0x0d62c34cc8e200c8abe65c74bb1e98a4ec3f599a',
'0xfff815e5cfe2b6adc31f98cace637f755f5f4a4c',
'0x0e5891d122b7b1cdbc113460ca43da781f0c4c19',
'0x1a876a725828cff234d872526edaa453f036a435',
'0xa3d6bad56cd234502d490966a1fcbbc5affb7241',
'0xf8425c8a141beb0d168632437e93ae03ed8a7897',
'0x546fe1ba130da27336c88bac5da6a608480f6878',
'0xcd7fdfd9e2f932ecb08c6375a6ad729de1662cc8',
'0xca56544d927233c080134b1e06d78a269edfeef1',
'0x159020c3c957670e42b628ec857c484789832d96',
'0x111cc7c046a2974d2783db116328d98c0021e5e8',
'0xc2cd106f15d2507ecf79bc5635fc2e387716be0e',
'0x51c03b8832f4eb00b7673a92a8bf28673ccb33af',
'0x80658e3657882cfa73fff0eb20c92aa5e948230c',
'0xf164416c99f8e065e25314452125dfc962c8d2b6',
'0x37cb4d36d02ea3dd4b8488686a4c0669b8908927'];
