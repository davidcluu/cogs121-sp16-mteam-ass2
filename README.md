--------------------
Design Principles
--------------------
* Discoverability/Signifiers
	> The search bar allows the users to quickly find the neighborhood they are interested in and view the crime rate and property value for that neighborhood. Autocomplete on the search bar makes it easier to find the name of the neighborhood the user is looking for.
* Learnability
	> The application's simple design allows the user to easily remember how to view the amount of crime in San Diego while also view specific information for a certain neighborhood. One page has a search bar to find a specific neighborhood. Another page allows the user to view crime rates on a city map.
* Feedback 
	> After searching for a neighborhood, a loading symbol gives the user feedback that the application is searching for their request.
* Natural Mapping/Mental Metaphors
	> The data is displayed as a map with the amount of crime committed in different parts of the county expressed through different colors. This is very similar to maps showing things like population density or elevation and would come naturally to users as most use maps with some sort of color coding.
* Constraints
	> Simple functionality constraits the user to two different kinds of interaction: viewing city through map or specifically searching the name of desired neighborhood.
* Error Prevention/Recovery 
	> auto complete on the search bar will appropriately list San Diego neighborhoods to help the user not mistype a neighborhood.
	> Message displayed when neighborhood not in San Diego.

-------------------
Design Decisions
-------------------
* TopoJSON was used to create an accurate map of San Diego in order to display crime data in a more visual way.
* Bootstrap was used to create neat and aesthetic navigation for the application and to implement forms such as the search bar on the home page.
* jQuery was used to implement the auto complete on the search bar, making it easier for the user to find the neighborhood they are looking for.

-------------------
Contributions
___________________

* Christine
	>
* David
	>
* James
	>
* Lauren
	>
* Marvin
	> came up with some of the functionalities for the application that met the design principles, implemented the auto complete on the search bar, and filled out the README

Customize bootstrap components:
http://getbootstrap.com/customize/?id=3f01ec377303ec8516c7e7aec6db95c5

Current config:
https://gist.github.com/anonymous/3f01ec377303ec8516c7e7aec6db95c5
