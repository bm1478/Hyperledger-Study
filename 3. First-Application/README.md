# First Application

배포된 블록체인 네트워크와 Connect 하는 법 배움.

Fabric SDK와 Contract API 사용, sample program 과 X.509를 생성하기 위한 배포된 Certificate Authority 사용

- Asset Transfer: 원장 초기화, query, 새 원장 만들기, 자산 ID에 따른 query, update 기존 자산, 자산 이동

구성요소

Sample Application: 블록체인 네트워크 호출 (트랜잭션 invoke, 체인 코드 실행)할 수 있음. fabric-samples/asset-transfer-basic/application-javascript

Smart Contract: 원장과의 상호작용을 포함한 트랜잭션 실행, fabric-samples/asset-transfer-basic/chaincode-(language) 에 있음.

3가지 단계 거침
1. Setting up a development environment: 스마트 컨트랙트와 어플리케이션 위한 네트워크 배포
2. Explore a sample smart contract: sample assetTransfer 스마트 컨트랙트 살펴봄. (안에 트랜잭션과 함께), 어플리케이션에서 query, update 원장 어떻게 하는지 살펴봄.
3. Interact with the smart contract with a sample application: 원장에 생성, 조회, 갱신 위해 assetTransfer 스마트 컨트랙트 사용
초기화, 자산 조회, 자산 범위 조회 등 다양한 트랜잭션 살펴봄.

0. Prerequisite
```shell script
node -v
npm -v
docker -v
sudo apt-get update
sudo apt-get install build-essetial
# python 2.7, make, C/C++ compiler
```

1. Set the blockchain network

test network에서 network 가져옴.

```shell script
cd fabric-samples/test-network
./network.sh up createChannel -c mychannel -ca # org admin user 자동 등록
./network.sh deployCC -ccn basic -ccl javascript
```
chaincode lifecycle 을 통해 pacakge, install, query installed chaincode, approve chaincode for both Org1 and Org2, commit chaincode 다 실행

```shell script
cd fabric-samples/asset-transfer-basic/application-javascript
npm install
```
`fabric-network`: 지위확인, 지갑, 채널 연결 게이트웨이, 트랜잭션 제출, 알림 기다림 담당
`fabric-ca-client`: 각각의 ca 활용한 유저 등록, fabric-network 를 통해 블록체인 네트워크와 통신할때 사용되는 타당한 인증확인서 생성 담당

네트워크 첫 실행 시 CA를 위한 등록사무관으로 admin user가 지정됨. enrollAdmin 애플리케이션을 통해 admin user를 위한 개인키, 공개키, X.509 인증서 발급
이 과정에서 Certificate Signing Request(CSR) 사용 - 개인키와 공개키가 로컬에서 생성 뒤 CA로 보내지고 인코딩된 인증서 반환
Wallet 에 저장되어 CA에서 관리자로 행동할 수 있게 함.

1. 애플리케이션에서 관리자 유저 등록

관리자 등록과 앱 사용자 등록은 어플리케이션과 체인코드 간 상호작용이 아니라 어플리케이션과 CA 간 상호작요이라는 것을 알아야된다.

Connection Profile Path 에서 정보 가져온 후, Connection Profile 있는지 확인하고, 어디에 Wallet 생성할 지 명시한 뒤,
enrollAdmin() 실행되고 인증서 생성됨.

정보 wallet/admin.id 에서 확인 가능

```
네트워크를 다운시키고 다시 불러오는 것으로 다시 시작하기로 하면,
자바스크립트 애플리케이션을 다시 실행하기 전에 지갑 폴더와 그 ID를 삭제해야 한다.
그렇지 않으면 오류가 발생한다. 
이는 시험 네트워크가 다운될 때 인증 기관과 그 데이터베이스가 제거되지만 원본 지갑은 여전히 애플리케이션 자바스크립트 디렉토리에 남아 있기 때문에 삭제해야 하기 때문이다.
샘플 javascript 애플리케이션을 다시 실행하면 새 지갑과 자격 증명이 생성된다.
```
enrollAdmin() 은 다른 샘플에서도 쓰이기 때문에 `fabric-samples/test-application/javascript/CAUtil.js`에 존재

2. 애플리케이션에서 애플리케이션 사용자 등록

admin user를 통해 블록체인 네트워크와 통신할 application user 등록
```javascript
await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');
```
admin user 등록과 비슷하게 CSR을 통해 appUser 등록한 뒤 정보를 저장 - admin, appuser 두 유저 나옴.

3. 샘플 애플리케이션이 채널과 스마트 컨트랙트와의 연결 준비

이전 단계에서 응용 프로그램은 관리자와 앱 사용자 자격 증명을 생성하여 지갑에 넣었다. 
자격 증명이 존재하며 이와 관련된 올바른 권한 속성을 가지고 있는 경우 
샘플 애플리케이션 사용자는 채널 이름과 계약 이름을 참조한 후 체인코드 기능을 호출할 수 있다.

우리의 연결 구성은 오직 당신 자신의 조직의 피어만을 지정한다. 
노드 클라이언트 sdk에 현재 온라인 상태인 다른 피어, 관련 승인 정책과 같은 메타데이터 및 나머지 노드와 통신하는 데 필요한 정적 정보를 가져오는 서비스 검색(피어에서 실행 중)을 사용하도록 지시한다. 
true로 설정된 asLocalhost는 클라이언트가 다른 패브릭 노드와 동일한 네트워크에서 실행 중이므로 localhost로 연결하라는 메시지를 표시한다. 
클라이언트를 다른 패브릭 노드와 동일한 네트워크에서 실행하지 않는 배포의 경우 asLocalhost 옵션이 false로 설정됨

당신은 어플리케이션 코드의 다음 라인에서 어플리케이션이 게이트웨이를 통해 계약명과 채널명을 사용하여 계약에 대한 참조를 얻고 있다는 것을 알게 될 것이다.

```javascript
// Create a new gateway instance for interacting with the fabric network.
// In a real application this would be done as the backend server session is setup for
// a user that has been verified.
const gateway = new Gateway();

try {
  // setup the gateway instance
  // The user will now be able to create connections to the fabric network and be able to
  // submit transactions and query. All transactions submitted by this gateway will be
  // signed by this user using the credentials stored in the wallet.
  await gateway.connect(ccp, {
    wallet,
    identity: userId,
    discovery: {enabled: true, asLocalhost: true} // using asLocalhost as this gateway is using a fabric network deployed locally
  });

  // Build a network instance based on the channel where the smart contract is deployed
  const network = await gateway.getNetwork(channelName);

  // Get the contract from the network.
  const contract = network.getContract(chaincodeName);
```
체인 코드가 여러 개의 contract 가지면 getContract(chaincodeName, smartContractName) 을 통해 접근

4. 애플리케이션 샘플데이터와 함께 초기화

submitTransaction() 함수는 서비스 검색을 사용하여 체인코드에 대해 필요한 승인 피어 집합을 찾고, 필요한 수의 피어에서 체인코드를 호출하고, 
해당 피어로부터 승인한 결과를 수집하고, 최종적으로 주문 서비스에 트랜잭션을 제출

5. 애플리케이션이 체인코드 invoke

애플리케이션 프로그램은 query peer 에서 실행되는 스마트 계약의 읽기 전용 호출을 사용하여 원장으로부터 가장 최근의 데이터를 볼 수 있다.
- World state: 현재 상태 볼 수 있음. 일련의 키-값 쌍으로 표시되며 응용 프로그램은 단일 키 또는 다중 키에 대한 데이터를 쿼리할 수 있다.
또한 CouchDB를 상태 데이터베이스로 사용하고 JSON에서 데이터를 모델링할 때 복잡한 쿼리를 사용하여 원장의 데이터를 읽을 수 있다. 이는 특정 키워드와 특정 값이 일치하는 모든 자산(예: 특정 소유자가 있는 모든 자산)을 찾을 때 매우 유용

*자세히 보기*
```javascript
const { Gateway, Wallets } = require('fabric-network');
```
appUser 신분서 wallet에 위치시키고, 네트워크와 연결
userId와 option 으로 gateway 생성

utility files 
- build the CAClient
- registerUser
- enrollAdmin
- buildCCP (common connection profile)
- buildWallet. 
`AppUtil.js` in the `test-application/javascript` directory.

```javascript
const ccpPath = path.resolve(__dirname, '..', '..', 'test-network','organizations','peerOrganizations','org1.example.com', 'connection-org1.json');
```
네트워크에서 가져옴

evaluateTransaction 방법은 블록체인 네트워크에서 스마트 계약과 가장 간단한 상호작용 중 하나이다. 
단순히 연결 프로필에 정의된 피어를 선택하고 요청을 전송하면, 해당 피어가 평가된다. 
스마트 계약은 피어의 원장 사본에 있는 자산을 조회하고 그 결과를 신청서에 반환한다. 
이러한 상호작용으로 인해 장부가 갱신되는 것은 아니다.

submitTransaction은 Transaction을 평가하는 것보다 훨씬 더 정교하다. 
SDK는 단일 피어와 상호 작용하기 보다는 체인코드의 승인 정책에 근거하여 블록체인 네트워크에 있는 모든 필수 조직의 피어에게 제출거래 제안을 보낼 것이다. 
이들 동료들은 각각 이 제안을 사용하여 요청된 스마트 계약을 실행함으로써 SDK가 승인(서명)하고 SDK로 반환하는 트랜잭션 응답을 생성한다. 
SDK는 승인되지 않은 모든 트랜잭션 응답을 단일 트랜잭션으로 수집하고, 이 응답을 주문자에게 제출한다. 
오더러는 다양한 애플리케이션 클라이언트의 트랜잭션을 수집하여 하나의 트랜잭션 블록으로 배열한다. 
이 블록들은 모든 트랜잭션이 검증되고 커밋되는 네트워크의 모든 피어에 배포된다. 
마지막으로 SDK는 이벤트를 통해 알림을 받아 애플리케이션에 대한 제어를 되돌릴 수 있다.

submitTransaction에는 트랜잭션이 유효성을 검사하고 장부에 커밋되었는지 확인하는 이벤트 수신기가 포함된다. 
애플리케이션은 커밋 수신기를 활용하거나, 당신을 위해 이것을 하는 submitTransaction과 같은 API를 활용해야 한다. 
이렇게 하지 않으면 거래가 성공적으로 주문, 검증 및 원장 위임에 실패했을 수 있다.

submitTransaction은 이 모든 것을 응용 프로그램에 대해 한다! 
애플리케이션, 스마트 계약, 동료, 주문 서비스가 함께 작용하여 
네트워크 전체에 걸쳐 원장을 일관적으로 유지하는 프로세스를 컨센서스라 한다.

응용 프로그램의 관점에서, 원장의 업데이트는 간단하다. 
애플리케이션은 거래를 블록체인 네트워크에 제출하고, 그것이 검증되고 커밋되면, 애플리케이션은 거래가 성공했다는 통보를 받는다. 
이면에는 블록체인 네트워크의 서로 다른 요소들이 함께 작용하여 모든 제안된 원장 업데이트가 유효하고 합의되고 일관된 순서로 수행되도록 하는 합의 과정이 수반된다.