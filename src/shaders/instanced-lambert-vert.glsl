#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.
in vec4 vs_Matrix_col0; //the instanced transformation
in vec4 vs_Matrix_col1; //the instanced transformation
in vec4 vs_Matrix_col2; //the instanced transformation
in vec4 vs_Matrix_col3; //the instanced transformation

out vec4 fs_Col;
out vec4 fs_Pos;

//for lambert
out vec4 fs_Nor; 
out vec4 fs_LightDir; 

//set a location for the light vec
//const vec4 lightFixed = vec4(50, 10, 50, 1); 
const vec4 lightFixed = vec4(15, 15, -100, 1); //use same camera position from the main file 

void main()
{
    fs_Col = vs_Col;
    fs_Pos = vs_Pos;
    mat4 transform = mat4(vs_Matrix_col0, vs_Matrix_col1, vs_Matrix_col2, vs_Matrix_col3);
    vec4 transformed = transform * vs_Pos; 

    //lambert variables
    mat3 norMat = inverse(transpose(mat3(transform))); 
    fs_Nor = vec4(norMat * vec3(vs_Nor), 0.0); 
    fs_LightDir = lightFixed - transformed; 

    gl_Position = u_ViewProj * transformed; 
}

//apply transformation 
//vec4 tp = M * vs_Pos
//glpos = viewproj * tp 