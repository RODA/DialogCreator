// completely unnecessary separate module, just to test the module system

export const cover = {

    addCover: () => {
        document.getElementById('editor-cover')?.classList.add('editor-cover');
    },

    removeCover: () => {
        document.getElementById('editor-cover')?.classList.remove('editor-cover');
    }

}
