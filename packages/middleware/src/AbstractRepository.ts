/**
 * Abstract repository class for all app data/cache repositories. This is a middleware because all (express)
 * microservices will share this interface.
 *
 * @since users-service-continued--JP
 */
export interface AbstractRepository {
  /**
   * Creates a new item in data store
   *
   * @param attrs  The attributes for the new item in data store
   *
   * @returns {any} The new item in data store
   */
  create(attrs: any): any;

  /**
   * Finds an item in data store by ID
   *
   * @param id  The ID of the item to find
   *
   * @returns {any} The item in data store
   */
  findById(id: any): any;

  /**
   * Updates an item in data store by ID
   *
   * @param id  The ID of the item to update
   * @param attrs  The attributes to update the item with
   *
   * @returns {any} The updated item in data store
   */
  updateById(id: any, attrs: any): any;

  /**
   * Deletes an item in data store by ID
   *
   * @param id  The ID of the item to delete
   *
   * @returns {any} The deleted item in data store
   */
  deleteById(id: any): any;  
}
