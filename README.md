#Design Principles

* __Discoverability/Signifiers__
  * The search bar allows the users to quickly find the neighborhood they are interested in and view the crime rate and property value for that neighborhood. Autocomplete on the search bar makes it easier to find the name of the neighborhood the user is looking for.
* __Learnability__
  * The application's simple design allows the user to easily remember how to view the amount of crime in San Diego while also view specific information for a certain neighborhood. One page has a search bar to find a specific neighborhood. Another page allows the user to view crime rates on a city map.
* __Feedback__
  * After searching for a neighborhood, a loading symbol gives the user feedback that the application is searching for their request.
* __Natural Mapping/Mental Metaphors__
  * The data is displayed as a map with the amount of crime committed in different parts of the county expressed through different colors. This is very similar to maps showing things like population density or elevation and would come naturally to users as most use maps with some sort of color coding.
* __Constraints__
  * Simple functionality constraints the user to two different kinds of interaction: viewing city through map or specifically searching the name of desired neighborhood.
* __Error Prevention/Recovery__
  * auto complete on the search bar will appropriately list San Diego neighborhoods to help the user not mistype a neighborhood.
  * Message displayed when neighborhood not in San Diego.


#Design Decisions

* __TopoJSON__ was used to create an accurate map of San Diego in order to easily display crime and housing data in a more visual way.
* __Bootstrap__ was used to create neat and aesthetic navigation for the application and to implement forms such as the search bar on the home page. For those on the front-end, we agreed that we were most familiar with Bootstrap and as such, could work more efficiently with its modular components. After reviewing other CSS frameworks, we found that Bootstrap had the components necessary to our application (like a navigation bar, search bar, table, etc.). Frameworks, like Semantic UI and Skeleton, did not have such components. While Bootstrap is arguably bulkier, we were able to pick and choose specific components to compile (with Less) and use.
* __jQuery__ was used to implement the auto complete on the search bar, making it easier for the user to find the neighborhood they are looking for.


#Contributions

* __Christine__
  * Brainstormed the design + functionalities of the app, worked on the front-end
* __David__
  * Worked on the back-end of the application, including the DELPHI database and the D3 map, as well as the map stylistically
* __James__
  * n/a
* __Lauren__
  * Brainstormed the design + functionalities of the application, worked on both the front-end and the back-end of the application as needed
* __Marvin__
  * Came up with some of the functionalities for the application that met the design principles, implemented the auto complete on the search bar, and filled out the README
