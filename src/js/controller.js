import { async } from 'regenerator-runtime';
import { MODAL_CLOSE_SEC } from './config.js';
import * as model from './module.js';
import RecipeView from './views/recipeView.js';
import SearchView from './views/searchView.js';
import ResultView from './views/resultView.js';
import PaginationView from './views/paginationView.js';
import BookmarksView from './views/bookmarksView.js';
import AddRecipeView from './views/addRecipeView.js';

// import 'core-js/stable';
// import 'regenerator-runtime/runtime';

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

if (module.hot) {
    module.hot.accept();
}

const controlRecipe = async function () {
    try {
        const id = window.location.hash.slice(1);

        if (!id) return;
        RecipeView.renderSpinner();

        //update result view to mark selected search result
        ResultView.update(model.getSearchResultPage());
        BookmarksView.update(model.state.bookmarks);

        // loading recipe
        await model.loadRecipe(id);

        // rendering recipe
        RecipeView.render(model.state.recipe);
    } catch (err) {
        RecipeView.renderError();
    }
};

const controlSearchResult = async function () {
    try {
        ResultView.renderSpinner();

        //get search query
        const query = SearchView.getQuery();
        if (!query) return;

        //load search result
        await model.loadSearchResult(query);

        //render result
        ResultView.render(model.getSearchResultPage());

        // render initial pagination button
        PaginationView.render(model.state.search);
    } catch (err) {
        console.log(err);
    }
};

const controlPagination = function (goToPage) {
    //render new result
    ResultView.render(model.getSearchResultPage(goToPage));

    // render new pagination button
    PaginationView.render(model.state.search);
};

const controlServings = function (newServings) {
    // update the recipe servings
    model.updateServings(newServings);

    // update the view (the recipe view)
    RecipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
    // add or remove bookmark
    if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
    else model.deleteBookmark(model.state.recipe.id);

    // update recipe view
    RecipeView.update(model.state.recipe);

    // render bookmarks
    BookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
    BookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
    try {
        //show render spinner
        AddRecipeView.renderSpinner();

        //upload the new recipe data
        await model.uploadRecipe(newRecipe);

        //render New recipe
        RecipeView.render(model.state.recipe);

        //succes message
        AddRecipeView.renderMessage();

        //render bookmark view
        BookmarksView.render(model.state.bookmarks);

        //change id in the url
        window.history.pushState(null, '', `#${model.state.recipe.id}`);

        // close form window
        setTimeout(function () {
            AddRecipeView.toggleWindow();
        }, MODAL_CLOSE_SEC * 1000);
    } catch (err) {
        console.error(err);
        AddRecipeView.renderError(err.message);
    }
};

const init = function () {
    BookmarksView.addHandleRender(controlBookmarks);
    RecipeView.addHandlerRender(controlRecipe);
    RecipeView.addHandlerUpdateServings(controlServings);
    RecipeView.addhandlerAddBookmark(controlAddBookmark);
    SearchView.addHandlerSearch(controlSearchResult);
    PaginationView.addHandlerClick(controlPagination);
    AddRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
