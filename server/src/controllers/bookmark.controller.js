import { StatusCodes } from "http-status-codes";
import Post from "../models/post.model.js";
import Tour from "../models/tour.model.js";
import Bookmark from "../models/bookmark.model.js";

class BookmarkController {
  // [GET] /:itemType/:itemId
  async getBookmark(req, res) {
    try {
      const { itemId, itemType } = req.params;
      const userId = req.user.userId;
      const bookmark = await Bookmark.findOne({
        user: userId,
        itemId,
        itemType
      });

      const data = {
        isBookmarkedByUser: !!bookmark,
      }

      return res.status(StatusCodes.OK).json({
        success: true,
        result: data,
      });
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  };

  // [POST] /:itemType/:itemId
  async createBookmark(req, res) {
    try {
      const { itemId, itemType } = req.params;
      const userId = req.user.userId;
      
      // verify the item exists
      let item;
      let itemName;
      if (itemType === "post") {
        itemName = "Post";
        item = await Post.findById(itemId);
      } else if (itemType === "tour") {
        itemName = "Tour";
        item = await Tour.findById(itemId);
      }
      
      if (!item) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          error: `${itemName} not found`
        });
      }

      const existingBookmark = await Bookmark.findOne({
        user: userId,
        itemId,
        itemType
      });

      if (existingBookmark) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: "Already bookmarked"
        });
      }
      
      // create a new bookmark
      const newBookmark = new Bookmark({
        user: userId,
        itemId,
        itemType
      });
      await newBookmark.save();
      
      return res.status(StatusCodes.CREATED).json({
        success: true,
        message: `${itemName} saved successfully`
      });
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }

  // [DELETE] /:itemType/:itemId
  async deleteBookmark(req, res) {
    try {
      const { itemId, itemType } = req.params;
      const userId = req.user.userId;
      const bookmark = await Bookmark.findOneAndDelete({
        user: userId,
        itemId,
        itemType
      });

      if (!bookmark) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          error: "Bookmark not found"
        });
      }

      return res.status(StatusCodes.OK).json({
        success: true,
        message: "Bookmark deleted successfully"
      });
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }

  // get all bookmarks of a user
  async getAllBookmarks(req, res) {
    try {
      const userId = req.user.userId;
      const postBookmarks = await Bookmark.find({ user: userId, itemType: "post" })
        .populate({
          path: "itemId",
          populate: [
            {
              path: "createdBy",
              select: "fullName username profilePicture"
            },
            {
              path: "bookmarks",
              select: "user -itemId",
            }
          ]
        });

      const tourBookmarks = await Bookmark.find({ user: userId, itemType: "tour" })
        .populate({
          path: "itemId",
          populate: [
            {
              path: "author",
              select: "fullName username profilePicture"
            },
            {
              path: "bookmarks",
              select: "user -itemId",
            }
          ]
        });

      // get absolute paths of the bookmarks
      const posts = postBookmarks.map((bookmark) => bookmark.itemId);
      const tours = tourBookmarks.map((bookmark) => bookmark.itemId);

      // deviate the bookmarks into posts and tours
      return res.status(StatusCodes.OK).json({
        success: true,
        result: { posts, tours },
      });
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new BookmarkController();
