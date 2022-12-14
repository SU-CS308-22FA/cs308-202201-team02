# cs308-202201-team02
https://talent-land1.herokuapp.com/ProfilePageScout
=======
# Team02-TalentLand

### https://shrouded-harbor-04645.herokuapp.com 
### Table of Contents
+ #### [1.Description](#desc)
+ #### [2.User Documentation](#userdoc)
  - [2.1 Installing the Software](#installandrunsoftware)
  - [2.2 Reporting bugs](#reportbugs)
  - [2.3 Known bugs](#knownbugs)
+ #### [3.Develeoper Documentation](#devdoc)
  - [3.1 Obtaining the source code](#obtainsource)
  - [3.2 Layout of the directory and branching](#layoutdirectory)
  - [3.3 Building and deploying](#buildanddeploy)
  
# **Talent Land**
# 1.Description <a name="desc"/>
<table>
<tr>
<td>

Talent Land is a social media web application which is designed for Turkish Football Federation. The main goal is facilitate the discovery of undiscovered football players and
increase the quality of football players.In addition, ensuring that young talents have equal chances and rights. Also, facilitating the scouts' work and at the same time preventing the transportation problem, enabling more than one scout to reach more than one young talent are the other goals. The project has been developed in JavaScript engine NodeJS with express for the frontend, MongoDB for the database system.
</td>
</tr>
</table>



# 2.User Documentation <a name="userdoc"/>
### 2.1 Installing the Software <a name="installandrunsoftware"/>
No installation is required. You can just click on the link: https://shrouded-harbor-04645.herokuapp.com

### 2.2 Reporting bugs <a name="reportbugs"/>
To report a bug, you can use scout request page message box. All of the messages that are come from this page will be evaluatedas as a repoorted bugs and responded.
If you have problems during the installation of the software project, you can send e-mail to the email adresses below:
bengisutepe@sabanciuniv.edu
bhadimlioglu@sabanciuniv.edu
beyzaarmagan@sabanciuniv.edu
kkaran@sabanciuniv.edu

### 2.3 Known bugs <a name="knownbugs"/>
Users can directly navigate to profile page with undefined username even users are not logged in.
Even users are not logged out, after a few times credentials automatically may return to null and username turns the undefined.

# 3. Developer Documentation <a name="devdoc"/>

### 3.1 Obtaining source code <a name="obtainsource"/>

Type git clone, and then paste the URL you copied earlier.
https://github.com/SU-CS308-22FA/cs308-202201-team02.git

You can clone the repository and run it with "nodemon app.js" or "node app.js" command line.

## 3.2 Layout of the Directory <a name="layoutdirectory"/>

**middleware**: Contains functions of rolelist.js to determine the user roles and permissions that are needed for authorization.

**node_modules**: Contains node packages for running project.

**public**: 
    *css*: Conains the design materials of the website. For profile page view there is profilePage.css and for the home page there is homePage.css files.
    *image*: Contains the image and icons that are used in web site.
    *js*: Contains validation functions for edit profile page(ProfilePageEdit.js).
    
**services**: Contains the functionalities for upload video.
**views**: Contains general view of the web site pages.
  *partials*: Contains the includes for the css files and form header.
**app.js**: Main logic functions and CRUD operations of the web site.
**package.json**: Contains the related packages.
   

## 3.3 Building and Deploying <a name="buildanddeploy"/>

Clone the Repository git clone https://github.com/SU-CS308-22FA/cs308-202201-team02.git
Open the working directory 
Install dependencies npm install
Run development server
Comment env port to be able to redirect conncection from deployed website to localhost:3000.
Open http://localhost:3000/ in browser

After clonning the project successfully, from the compiler you have to install some packages from the terminal:

You have to install required packages from ‘package.json’ by using "npm install".

After installation:

-  Connect the backend by writing terminal to ‘nodemon app.js’or "node app.js".
