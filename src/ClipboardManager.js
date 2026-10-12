class ClipboardManager {

  constructor() {

    this.clipboard = null;

  }

  /*
   * Copy data into clipboard
   */

  copy(data) {

    if (!data) {
      return;
    }

    this.clipboard =

      JSON.parse(
        JSON.stringify(data)
      );

  }

  /*
   * Return deep clone of clipboard
   */

  paste() {

    if (!this.clipboard) {
      return null;
    }

    return JSON.parse(

      JSON.stringify(
        this.clipboard
      )

    );

  }

  /*
   * Clear clipboard
   */

  clear() {

    this.clipboard = null;

  }

  /*
   * Clipboard exists?
   */

  hasData() {

    return (
      this.clipboard !== null
    );

  }

  /*
   * Inspect clipboard
   */

  getData() {

    if (!this.clipboard) {
      return null;
    }

    return JSON.parse(

      JSON.stringify(
        this.clipboard
      )

    );

  }

}

export default new ClipboardManager();
