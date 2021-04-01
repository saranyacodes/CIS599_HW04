# Saranya Sampath submission

## Demo
Here is a link to the demo: 

## Description of Trees
These are pastel LSystem trees! 

There are some parameters you can edit to change the tree shape. They are the following: 
 - Iterations: how many iterations should the grammar be parsed for the LSystem to grow 
 - Leaf_Density: how many leaves are in the tree 
 - Branch_Angle: adjust the angle of the branches
 - Leaves_Color: change the color of the leaves 
 - Branch_Color: change the color of the branches 
 - Thick branch: use this check box to make the branches thick or not 
 - Leaf_Type: this is a drop down menu which lets you choose from three different models to use for the leaves! You can choose from regular leaves, roses, or even stars! 

 This LSystem makes use of techniques such as instanced rendering to draw the branches and leaves, as the code keeps track of transformation matrices which are later applied in the instanced-mat-vert shader. The tree is drawn through using segments made out of a cylinder obj. 

 ## References

 I modeled the cylinder obj and the star obj myself, but I used some free online assets for the other types of leaves. 

 Here is a link to where I got the rose obj: https://www.cgtrader.com/free-3d-models/plant/flower/red-rose-1e8ab8e4-b55c-486d-9edf-c965e49703b7

 Here is a link to where I got the leaves obj: https://www.cgtrader.com/free-3d-models/plant/leaf/leaf-179bf0f0-8540-4263-a2ac-c1ae6586d93f 