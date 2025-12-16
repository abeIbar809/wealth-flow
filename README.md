# Frontend

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

3. Create a .env file in the frontend directory 
   - In the file add: EXPO_PUBLIC_API_BASE_URL=http://<YOURIP>:9000
      * You can find your IP using "ipconfig" in your command prompt

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.


# BACKEND

To start:
   - navigate to backend directory
   - npm install
   - set .env var MONGO_URI to your mongo connect string
      - When pressing connect on Atlas site click on drivers and choose node.js
      - at the end of your string (.mongodb.net/wealth-flow?appName=WealthFlow") make sure you have the "wealth-flow" before the ? and after the /
   - run node server.js

## Accessing from Frontend
When accessing DB from the frontend, you need to hardcode your IP address rather then localhost because you are on your phone.

Check backend/routes for CRUD operation endpoints. Each collection has its own file.
   - To perform the operation use https://YOURIP:9000/COLLECTION/PARAMS
   - If posting or updating, the body of the request just needs a json covering all attributes for the schema of that collection. 
