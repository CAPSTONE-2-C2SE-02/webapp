import Interactions from "../models/interactions.model.js";

export const recordInteraction = async (userId, tourId, type) => {
  try {
    const interaction = await Interactions.findOne({ userId, tourId, interaction_type: type });
    if (interaction) {
      return interaction;
    } else {
      const newInteraction = new Interactions({ userId, tourId, interaction_type: type });
      await newInteraction.save();
      return newInteraction;
    }
  } catch (error) {
    throw new Error("Error recording interaction: " + error.message);
  }
}