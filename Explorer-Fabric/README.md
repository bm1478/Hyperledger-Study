# Connect With Explorer and Fabric

(Explorer 공식 Github README 참조)

1. Prerequisites

Fabric Test Network / Docker /Docker Compose

2. 명령어 (실패)
```shell script
wget https://raw.githubusercontent.com/hyperledger/blockchain-explorer/master/examples/net1/config.json
wget https://raw.githubusercontent.com/hyperledger/blockchain-explorer/master/examples/net1/connection-profile/first-network.json -P connection-profile
wget https://raw.githubusercontent.com/hyperledger/blockchain-explorer/master/docker-compose.yaml
cp -r ../fabric-samples/test-network/organizations/ organizations
```

docker compose.yaml 이 부분 수정 (네트워크 이름, volume 컨테이너에 맞게)
```yaml
 networks:
    mynetwork.com:
        external:
            name: net_test

    ...

    services:
      explorer.mynetwork.com:

        ...

        volumes:
          - ./config.json:/opt/explorer/app/platform/fabric/config.json
          - ./connection-profile:/opt/explorer/app/platform/fabric/connection-profile
          - ./organizations:/tmp/crypto
          - walletstore:/opt/wallet
```

connection profile - first_network.json 에서
```json
"organizations": {
    "Org1MSP": {
      "adminPrivateKey": {
        "path": "/tmp/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/priv_sk"
```
signedCert, peers - tlsCACerts (절대경로로 수정해줌)
실제 패브릭 organization > 쭉 들어가서 Admin private key 가져와서 바꿔줌.

3. Code 로

1) Prerequisites

Nodejs 10 and 12 (10.19 and 12.16 tested)

PostgreSQL 9.5 or greater
```shell script
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
psql --version
sudo service postgresql status
sudo service postgresql start
sudo service postgresql stop

sudo passwd postgres
sudo service postgresql start
sudo -u postgres psql
alter user postgres with password '1234' 로 비밀번호 설정 해줘야함.

# postgres=# CREATE DATABASE fabricexplorer OWNER postgres
# \q 입력시 나감.
```
jq
```shell script
sudo apt-get install jq
jq --version
```

Linux-based operating system, such as Ubuntu or MacOS

golang (optional)

For e2e testing

2) Clone
```shell script
git clone https://github.com/hyperledger/blockchain-explorer.git
cd blockchain-explorer
```

app/platform/fabric/config.json

app/platform/fabric/connection-profile/first-network.json

수정

```shell script
chmod -R 775 db/
cd blockchain-explorer/app/persistence/fabric/postgreSQL/db
sudo -u postgres ./createdb.sh
sudo -u postgres psql -c '\l'
sudo -u postgres psql fabricexplorer -c '\d'

cd blockchain-explorer
./main.sh install
./main.sh clean

./start.sh
./stop.sh
```