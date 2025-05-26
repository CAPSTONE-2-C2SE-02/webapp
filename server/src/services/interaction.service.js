import axios from "axios";
import Interactions from "../models/interactions.model.js";

export const recordInteraction = async (userId, tourId, type) => {
  try {
    // create a new interaction
    const interaction = await Interactions.findOne({
      userId,
      tourId,
      interaction_type: type
    });

    if (!interaction) {
      const newInteraction = new Interactions({
        userId,
        tourId,
        interaction_type: type
      });
      await newInteraction.save();
      axios.post(`http://127.0.0.1:8020/retrain`)
        .then(() => console.log("Retrain queued"))
        .catch(err => console.error("Retrain error:", err.message));
    }
  } catch (error) {
    throw new Error("Error recording interaction: " + error.message);
  }
}

export const deleteInteraction = async (userId, tourId, type) => {
  try {
    await Interactions.findOneAndDelete({
      userId,
      tourId,
      interaction_type: type
    });
  } catch (error) {
    throw new Error("Error deleting interaction: " + error.message);
  }
}