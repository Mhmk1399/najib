import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

const connect = async () => {
  const connectionStatus = mongoose.connection.readyState;
  
  
  if (connectionStatus === 1) {
    return;
  }
  
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }
  
  try {
    await mongoose.connect(MONGODB_URI);
  } catch (error) {
    throw error;
  }
};

export default connect;
