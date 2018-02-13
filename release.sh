# Load keystore information from environment
export $(cat .env | xargs)
cd android && ./gradlew assembleRelease
