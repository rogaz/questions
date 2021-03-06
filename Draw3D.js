/*
//----------------------------------------------------------------------------
// File........... : Draw3D.js
// Project........ :
// Created ....... : 09/10/2011 17:00
// Modified....... : 20/10/2011 03:00
// Version ....... : 1.03
// Author ........ : Moshe Halevi
//                 : halemo@gmail.com
//                 :
// Compiler        : HTML5
// Module ........ : 3D API for HTML5 canvas element
// Sub-module .... :
// Description ... : handle 3D drawing and moving on a HTML5 2D canvas element
//----------------------------------------------------------------------------
*/


//--------------------------------------------------------------------------
function Draw3D(canvasId)  
{
    //object: usage: var myCanvas3D = new Draw3D();

    //canvas
    this.canvas = 0;
    this.ctx = 0;
    this.width = 800;
    this.height = 800;
    //------------------------------------------
    //Canvas 
    //------------------------------------------
    //canvas
    this.canvas = 0;
    this.ctx = 0;
    this.width = 800;
    this.height = 800;

    //center of the canvas
    this.cu = 400;  //center u-axis (horizonal)
    this.cv = 400;  //center v-axis (vertical)

    
    //------------------------------------------
    //Axes x-y-z
    //------------------------------------------
    //range
    this.MinX = -400;
    this.MaxX = 400;
    this.ScaleX = 10;
    this.MinY = -400;
    this.MaxY = 400;
    this.ScaleY = 10;
    this.MinZ = -400;
    this.MaxZ = 400;
    this.ScaleZ = 10;
    //
    //Axes Drawings flags
    this.isDrawAxisU = true; 
    this.isDrawAxisV = true; 
    //
    this.isDrawAxisX = true; 
    this.isDrawAxisY = true; 
    this.isDrawAxisZ = true; 
    this.isDrawGridX = true; //mishbezot
    this.isDrawGridY = true;
    this.isDrawGridZ = false; //true;
    this.isDrawTickX = true;
    this.isDrawTickY = true;
    this.isDrawTickZ = false; //true;
    this.isDrawTextX = true;
    this.isDrawTextY = true;
    this.isDrawTextZ = true;
    //
    this.TextSizeAxis = 15; //20;
    //
    //colors
    this.colorAxesXYZ = "black";
    this.colorGrid = "rgb(220,220,220)";
    this.colorTick = "black";
    this.colorAxexUV = "gray";

    //alert(this.colorGrid.toRGB());
    
    //
    //Zoom
    this.MaxZoom = 2;
    this.MinZoom = 0.25;
    //
    this.Zoom = 1;    //User Zooming
    //
    this.RatioX = 1;  //RatioX = Canvas width / X-Axis length . Calculated by SetAxes()
    this.RatioY = 1;  //RatioY = Canvas width / Y-Axis length . Calculated by SetAxes()
    this.RatioZ = 1;  //RatioZ = Canvas height / Z-Axis length . Calculated by SetAxes()
    
    //constants: angles units
    this.RADIANS = 0;   
    this.DEGREES = 360;  
    //this.GRADIANS = 400;    //not supported yet...
    
    //angles of x,y,z axis from the u-axis (horizonal)
    this.AngleUnits = this.DEGREES;  //can be: 0=radians, 360=degrees, 400=gradians
    this.AngleX = -15;
    this.AngleY = 15;
    this.AngleZ = 90;
    
    //Transformation
    this.TransformU = 1;   //+ to + : positive value (x,y,z) to positive value on u-axis
    this.TransformV = -1;  //+ to - : positive value (x,y,z) to negative value on v-axis
    
    //Point of view     
    //Values should be: 
    //0=Top View 
    //1=Front View
    this.ViewX = 1;  
    this.ViewY = 1;  
    this.ViewZ = 1;  
    
    this.SetCanvas(canvasId);
}
//--------------------------------------------------------------------------
Draw3D.prototype.Reset = function() 
{
    this.View3D();
    this.ResetAngles();
    this.ResetAxes();
    this.Zoom = 1;  
    this.TransformU = 1;
    this.TransformV = -1;
    this.Zoom = 1;  
}
//--------------------------------------------------------------------------
Draw3D.prototype.GetAngleX = function() 
{
    var angle = this.AngleX;
    if (this.AngleUnits == this.DEGREES)
      angle = rad(angle);
    return angle;
}
//--------------------------------------------------------------------------
Draw3D.prototype.GetAngleY = function() 
{
    var angle = this.AngleY;
    if (this.AngleUnits == this.DEGREES)
      angle = rad(angle);
    return angle;
}
//--------------------------------------------------------------------------
Draw3D.prototype.GetAngleZ = function() 
{
    var angle = this.AngleZ;
    if (this.AngleUnits == this.DEGREES)
      angle = rad(angle);
    return angle;
}
//--------------------------------------------------------------------------
Draw3D.prototype.SetCanvas = function(canvasId) 
{
    this.canvas = document.getElementById(canvasId);   
    if (this.canvas)
    {
        this.id = this.canvas.id; 
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        var ax = this.GetAngleX();  //radians
        var ay = this.GetAngleY();
        var az = this.GetAngleZ();

        var width = this.width;
        var height = this.height;
        
        var cu = width / 2;
        var cv = height / 2
        
        this.MinX = -(cu) / Math.cos( ax );
        this.MaxX = (cu) / Math.cos( ax );
        this.ScaleX = cu/10;  //width/20;
        this.MinY = -(cu) / Math.cos( ay );
        this.MaxY = (cu) / Math.cos( ay );
        this.ScaleY = cu/10; //width/20;
        this.MinZ = -(cv);
        this.MaxZ = (cv);
        this.ScaleZ = cv/10; //height/20;
        
        //center of u-v-axes
        this.cu = cu; //width/2;
        this.cv = cv; //height/2;
        
    }
    
}
//--------------------------------------------------------------------------
//Draw3D - convert (x,y,z) axes to (u,v) axes
//--------------------------------------------------------------------------
Draw3D.prototype.Point3Dto2D = function(x1,y1,z1) 
{
   //  This is the most important function in Draw3D class.
   //  This function converts 3D point set (x,y,z) to 
   //  a 2D point set (u,v) of the canvas.
   //
   //  All drawing function use this function to draw a 3D objects
   //  on a 2D canvas, a drawing element of HTML5.
   //
   //
   //  ----------------------   
   //  3D point on 3D graph 
   //  ----------------------   
   //             
   //             z+
   //             |
   //             |     y+
   //             |    /
   //             |az /   o (x,y,z)
   //         x-  |  / 
   //           \ | /  ay  (angle > 0)
   //            \|/_____________________
   //             /\   ax  (angle < 0)
   //            /  \
   //          y-    \
   //                 \
   //                  x+
   // 
   // 
   //  ----------------------   
   //  2D point on 2D graph 
   //  ----------------------   
   // 
   //             v+
   //             |
   //             |
   //             |   o (u,v)
   //             |    
   //  u- --------+------------> u+
   //             |
   //             |
   //             |
   //             |
   //             v-
   // 
   // 
   //  ----------------------   
   //  2D point on canvas: 
   //  ----------------------   
   //  tu: transformation on u axis is 1
   //  tv: transformation on v axis is -1  (flip positive to negative)
   // 
   // 
   //  (0,0)                  
   //     +-------------------- u+
   //     |
   //     |   o (u,v)           
   //     |    
   //     |         o (cu,cv)        = logical center of u,v axes
   //     |        
   //     |    
   //     |
   //     v+
   // 
   // 
   //  function Point3Dto2D 
   //  converts [x,y,z] point position to canvas real position [u,v]
   // 
   // 
   
   var x = x1 * this.ViewX * this.RatioX * this.Zoom;  //when no ZoomIn/ZoomOut, Zoom = 1
   var y = y1 * this.ViewY * this.RatioY * this.Zoom;
   var z = z1 * this.ViewZ * this.RatioZ * this.Zoom;
   
   var uv = [0,0];
   //
   //angles x,y,z to from u axis (horizonal line - x axis)
   var ax = this.AngleX; 
   var ay = this.AngleY; 
   var az = this.AngleZ; 

   if (this.AngleUnits == this.DEGREES)
   {
      //convert angles from degree unit to radian unit
      ax *= Math.PI/180; 
      ay *= Math.PI/180; 
      az *= Math.PI/180; 
   }
   //
   //transformation
   var tu = this.TransformU;   //+ to + : positive value (x,y,z) to positive value on u-axis
   var tv = this.TransformV;  //+ to - : positive value (x,y,z) to negative value on v-axis
   //
   //vector math:
   //u = u(x) + u(y) + u(z)
   var ux = tu * x * Math.cos(ax);
   var uy = tu * y * Math.cos(ay);
   //var uz = tu * z * 0;   //0=cos(90)
   var uz = tu * z * Math.cos(az);
   var u = ux + uy + uz;

   //vector math:
   //v = v(x) + v(y) + v(z)   
   var vx = tv * x * Math.sin(ax);
   var vy = tv * y * Math.sin(ay);
   //var vz = tv * z * 1;  //1=sin(90)
   var vz = tv * z * Math.sin(az);
   var v = vx + vy + vz;
   
   uv[0] = u + this.cu;  //the calculated point + center of the graph (horizonal axis u)
   uv[1] = v + this.cv;  //the calculated point + center of the graph (vertical axis u)
   //
   return uv; 
}
//--------------------------------------------------------------------------
Draw3D.prototype.Point2DtoXYZ = function(u1,v1, z) 
{
   var xyz = [0,0,0];
   
   //angles x,y,z to from u axis (horizonal line - x axis)
   var ax = this.AngleX; 
   var ay = this.AngleY; 
   var az = this.AngleZ; 

   if (this.AngleUnits == this.DEGREES)
   {
      //convert angles from degree unit to radian unit
      ax *= Math.PI/180; 
      ay *= Math.PI/180; 
      az *= Math.PI/180; 
   }
   //transformation
   var tu = this.TransformU;   //+ to + : positive value (x,y,z) to positive value on u-axis
   var tv = this.TransformV;   //+ to - : positive value (x,y,z) to negative value on v-axis

   var u = u1 - this.cu;
   var v = v1 - this.cv;
   
   u *= tu;
   v *= tv;
   
   var x = 0;
   var y = 0; 
   //var z = 0; 
   if (1)
   {
      // D = A*x + B*y + C*z   is:   u = x*cos(ax) + ycos(ay) + z*cos(az)
      // H = E*x + F*y + G*z   is:   v = x*sin(ax) + ysin(ay) + z*sin(az)
            
      // we must set z with a value in order to find x,y points
      
      // Ax + By = C
      // x*cos(ax) + ycos(ay) = u - z*cos(az);
      // Dx + Ey = F
      // x*sin(ax) + ysin(ay) = v - z*sin(az);
        
      A = Math.cos(ax);
      B = Math.cos(ay);
      C = u - z*Math.cos(az);
      //
      D = Math.sin(ax);
      E = Math.sin(ay);
      F = v - z*Math.sin(az);
      
      var xy = [0,0];
      xy = CalcEquation(A,B,C,D,E,F);
      x = xy[0];
      y = xy[1];
      
   }
   
   if (1)
   {
       xyz[0] = x;
       xyz[1] = y;
       xyz[2] = z;
   }
   return xyz;
}
//--------------------------------------------------------------------------


//--------------------------------------------------------------------------
Draw3D.prototype.ResetAxes = function()
{
    if (this.canvas)
    {
        var ax = this.GetAngleX();  //radians
        var ay = this.GetAngleY();
        var az = this.GetAngleZ();

        var width = this.width;
        var height = this.height;
        
        var cu = width / 2;
        var cv = height / 2
        
        this.MinX = -(cu) / Math.cos( ax );
        this.MaxX = (cu) / Math.cos( ax );
        this.ScaleX = cu/10;  //width/20;
        this.MinY = -(cu) / Math.cos( ay );
        this.MaxY = (cu) / Math.cos( ay );
        this.ScaleY = cu/10; //width/20;
        this.MinZ = -(cv);
        this.MaxZ = (cv);
        this.ScaleZ = cv/10; //height/20;
        
///*Changes
        //center of u-v-axes
        //this.cu = cu; //width/2;
        //this.cv = cv; //height/2;
        this.cu = 170;
        this.cv = 380; //height/2;
        this.SetAngleX(0);
		    this.SetAngleY(90);
		    this.SetAngleZ(172);
//*/
        
    }

}
//--------------------------------------------------------------------------
Draw3D.prototype.SetAxes = function( MinX, MaxX, ScaleX,
                                     MinY, MaxY, ScaleY,  
                                     MinZ, MaxZ, ScaleZ )  
{

    if (1)
    {
        this.MinX = MinX;
        this.MaxX = MaxX;
        this.ScaleX = ScaleX;
        this.MinY = MinY;
        this.MaxY = MaxY;
        this.ScaleY = ScaleY;
        this.MinZ = MinZ;
        this.MaxZ = MaxZ;
        this.ScaleZ = ScaleZ;

        var ax = this.GetAngleX();  //radians
        var ay = this.GetAngleY();
        var az = this.GetAngleZ();

        var LX = (MaxX - MinX);
        var LY = (MaxY - MinY);
        var LZ = (MaxZ - MinZ);
        
        this.RatioX = this.width  / LX;
        this.RatioY = this.width  / LY;
        this.RatioZ = this.height / LZ;
        
    }        
}
//--------------------------------------------------------------------------
//Draw3D Drawing function
//--------------------------------------------------------------------------
Draw3D.prototype.Clear = function()
{
    var ctx = this.ctx;
    ctx.save();
    //ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
}
//--------------------------------------------------------------------------
Draw3D.prototype.DrawFrame = function(color, lineWidth)
{
    var ctx = this.ctx;
    ctx.save();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.strokeRect(0,0,ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
}
//--------------------------------------------------------------------------
Draw3D.prototype.Line = function(x1,y1,z1, x2,y2,z2, color)
{
    //center
    var cv = 0; //this.cv;
    var cu = 0; //this.cu;
    
    var u1,u2;
    var v1,v2;
    
    if (1)
    {
        var uv = [0,0];
        uv = this.Point3Dto2D(x1,y1,z1);
        u1 = uv[0];
        v1 = uv[1];
        uv = this.Point3Dto2D(x2,y2,z2);
        u2 = uv[0];
        v2 = uv[1];
    }
    
    if (1)
    {
        Draw2D_Line(this.ctx,cu+u1,cv+v1,cu+u2,cv+v2, color);
    }

}
//----------------------------------------------------------------------------
Draw3D.prototype.LineCustom = function(x1,y1,z1, x2,y2,z2, color_line, border_line_weight)
{
    //center
    var cv = 0; //this.cv;
    var cu = 0; //this.cu;
    
    var u1,u2;
    var v1,v2;
    
    if (1)
    {
        var uv = [0,0];
        uv = this.Point3Dto2D(x1,y1,z1);
        u1 = uv[0];
        v1 = uv[1];
        uv = this.Point3Dto2D(x2,y2,z2);
        u2 = uv[0];
        v2 = uv[1];
    }
    
    if (1)
    {
        Draw2D_LineCustom(this.ctx,cu+u1,cv+v1,cu+u2,cv+v2, color_line, border_line_weight);
    }

}
//----------------------------------------------------------------------------
Draw3D.prototype.DrawAxes = function()  //grid lines, ticks, axes
{
   if (1)
   {
        var axis_color = this.colorAxesXYZ;
        var grid_color = this.colorGrid;
        var tick_color = this.colorTick;
        var max_tick = 4;
        var tick = 3;
        var m = 1; //m=multiply the grid total lines by m
        
        //-----------------------------
        //get the values
        //-----------------------------
        var MinX = this.MinX;
        var MaxX = this.MaxX;
        var ScaleX = this.ScaleX;
        var MinY = this.MinY;
        var MaxY = this.MaxY;
        var ScaleY = this.ScaleY;
        var MinZ = this.MinZ;
        var MaxZ = this.MaxZ;
        var ScaleZ = this.ScaleZ;
                
        var isDrawAxisU = this.isDrawAxisU; 
        var isDrawAxisV = this.isDrawAxisV; 
        var isDrawAxisX = this.isDrawAxisX; 
        var isDrawAxisY = this.isDrawAxisY; 
        var isDrawAxisZ = this.isDrawAxisZ; 
        var isDrawGridX = this.isDrawGridX;
        var isDrawGridY = this.isDrawGridY;
        var isDrawGridZ = this.isDrawGridZ;
        var isDrawTickX = this.isDrawTickX;
        var isDrawTickY = this.isDrawTickY;
        var isDrawTickZ = this.isDrawTickZ;
        var isDrawTextX = this.isDrawTextX;
        var isDrawTextY = this.isDrawTextY;
        var isDrawTextZ = this.isDrawTextZ;
        
        //-----------------------------
        //draw grid lines and ticks
        //-----------------------------
        var i;
/*
        //draw x-axis scale lines (parallel lines to y-axis)
        if (ScaleX > 0)
        {
            tick = max_tick;
            //if ((this.AngleY % 180) != 0)       
              tick = max_tick / Math.sin(this.AngleY);
              
            for (i=0; i >= m*MinX; i -= ScaleX)
            {
               if (isDrawTickX)
                 this.Line(i,-tick,0, i,tick,0, tick_color);
               if (isDrawGridX)
               {
                   //XY
                   this.Line(i,m*MinY,0, i,m*MaxY,0, grid_color);
                   //XZ
                   if (isDrawGridZ)
                     this.Line(i,0,m*MinZ, i,0,m*MaxZ, grid_color);
               }
            }
            for (i=0; i <= m*MaxX; i += ScaleX)
            {
               if (isDrawTickX)
                 this.Line(i,-tick,0, i,tick,0, tick_color);
               if (isDrawGridX)
               {
                   //XY
                   this.Line(i,m*MinY,0, i,m*MaxY,0, grid_color);
                   //XZ
                   if (isDrawGridZ)
                     this.Line(i,0,m*MinZ, i,0,m*MaxZ, grid_color);
               }
            }
        }
        //draw y-axis scale lines (parallel lines to x-axis)
        if (ScaleY > 0)
        {
            tick = max_tick;
            //if ((this.AngleX % 180) != 0)       
              tick = max_tick / Math.sin(this.AngleX);
              
            for (i=0; i >= m*MinY; i -= ScaleY)
            {
               if (isDrawTickY)
                 this.Line(-tick,i,0, tick,i,0, tick_color);
               if (isDrawGridY)
               {
                   //XY
                   this.Line(m*MinX,i,0, m*MaxX,i,0, grid_color);
                   //YZ
                   if (isDrawGridZ)
                     this.Line(0,i,m*MinZ, 0,i,m*MaxZ, grid_color);
               }
            }
            for (i=0; i <= m*MaxY; i += ScaleY)
            {
               if (isDrawTickY)
                 this.Line(-tick,i,0, tick,i,0, tick_color);
               if (isDrawGridY)
               {
                  //XY
                  this.Line(m*MinX,i,0, m*MaxX,i,0, grid_color);
                  //YZ
                  if (isDrawGridZ)
                    this.Line(0,i,m*MinZ, 0,i,m*MaxZ, grid_color);
               }
            }
        }
        //draw z-axis scale lines (vertical lines)
        if (ScaleZ > 0)
        {
            tick = max_tick;
            if ((this.AngleZ % 180) != 0)       
              tick = max_tick / Math.sin(this.AngleZ);
              
            for (i=0; i >= m*MinZ; i -= ScaleZ)
            {
               if (isDrawTickZ)
                 this.Line(-tick,-tick,i, tick,tick,i, tick_color);
               if (isDrawGridZ)
               {
                  //XYZ
                  //this.Line(m*MinX,m*MinY,i, m*MaxX,m*MaxY,i, grid_color);
                  
                  //XZ
                  this.Line(m*MinX,0,i, m*MaxX,0,i, grid_color);
                  //YZ
                  this.Line(0,m*MinY,i, 0,m*MaxY,i, grid_color);
               }
            }
            for (i=0; i <= m*MaxZ; i += ScaleZ)
            {
               if (isDrawTickZ)
                 this.Line(-tick,-tick,i, tick,tick,i, tick_color);
               if (isDrawGridZ)
               {
                  //XYZ
                  //this.Line(m*MinX,m*MinY,i, m*MaxX,m*MaxY,i, grid_color);
                  
                  //XZ
                  this.Line(m*MinX,0,i, m*MaxX,0,i, grid_color);
                  //YZ
                  this.Line(0,m*MinY,i, 0,m*MaxY,i, grid_color);
               }
            }
        }
*/
        
        //-----------------------------
        //draw x,y,z axes
        //-----------------------------
/*
        if (1)
        {
            //x axis
            if (isDrawAxisX)
            {
               this.Line(MinX,0,0, MaxX,0,0, axis_color);
               
               var pt = 10;
               var uv = this.Point3Dto2D(MaxX-pt,0,0); 
               this.Triangle( MaxX,0,0,  MaxX-2*pt,pt,0,  MaxY-2*pt,-pt,0, axis_color, axis_color);
               
            }
            //y axis
            if (isDrawAxisY)
            {
               this.Line(0,MinY,0, 0,MaxY,0, axis_color);
               
               var pt = 10;
               var uv = this.Point3Dto2D(0,MaxY-pt,0); 
               //Draw2D_DrawArrowPoint(this.ctx,uv[0],uv[1], 10, 90, axis_color, axis_color);
               this.Triangle( 0,MaxY,0,  pt,MaxY-2*pt,0,  -pt,MaxY-2*pt,0, axis_color, axis_color);

               
            }
            //z axis
            if (isDrawAxisZ)
            {
               this.Line(0,0,MinZ, 0,0,MaxZ, axis_color);
               
               var pt = 10;
               var uv = this.Point3Dto2D(0,0,MaxZ-pt); 
               //Draw2D_DrawArrowPoint(this.ctx,uv[0],uv[1],10, 0, axis_color, axis_color);
               this.Triangle( 0,0,MaxZ,  pt,0,MaxZ-2*pt,  -pt,0,MaxZ-2*pt, axis_color, axis_color);

            }
        }
*/
        //-----------------------------
        //draw u,v axes
        //-----------------------------
        /*
        if (1)
        {
            var pt = 10;
            var uv_axes_color = this.colorAxexUV; 
            var x1 = pt;
            var y1 = pt;
            var x2 = this.width-pt;
            var y2 = y1;
            var x3 = this.width-pt;
            var y3 = this.height-pt;
            var x4 = x1;
            var y4 = y3;
            
            if (isDrawAxisU)
            {
               Draw2D_Line(this.ctx,x1,y1,x2-pt,y2,uv_axes_color);
               Draw2D_DrawArrowPoint(this.ctx,x2-pt,y2,10, 90, uv_axes_color, uv_axes_color);
            }
            if (isDrawAxisV)
            {
               Draw2D_Line(this.ctx,x1,y1,x4,y4-pt,uv_axes_color);
               Draw2D_DrawArrowPoint(this.ctx,x4,y4-pt,10, 180, uv_axes_color, uv_axes_color);
            }

              
            if (1)
            {
                var ctx = this.ctx;
                ctx.save();
                var TextSize = this.TextSizeAxis;
                //ctx.textBaseline = 'bottom';		  
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';		  
                //ctx.textAlign = 'left';		  
                ctx.fillStyle = uv_axes_color;
                ctx.font = "" + TextSize + "px bold Arial";
                if (isDrawAxisV)
                  ctx.fillText("V",x4,y4);
                if (isDrawAxisU)
                  ctx.fillText("U",x2,y2);
                ctx.restore();
            }
        }*/
        //-----------------------------
        //draw text - x,y,z axes names
        //-----------------------------
/*
        if (1)
        {
            var ctx = this.ctx;
            ctx.save();
            var TextSize = this.TextSizeAxis;
			//ctx.textBaseline = 'bottom';		  
	        ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';		  
			//ctx.textAlign = 'left';		  
			ctx.fillStyle = axis_color;
			ctx.font = "" + TextSize + "px bold Arial";
            var uv = this.Point3Dto2D(-TextSize+MaxX,TextSize,TextSize);
            var u = uv[0];
            var v = uv[1];            
            if (isDrawTextX)
			  ctx.fillText("X",u,v);
            uv = this.Point3Dto2D(-TextSize,-TextSize+MaxY,TextSize);
            u = uv[0];
            v = uv[1];
            if (isDrawTextY)
  			  ctx.fillText("Y",u,v);
            uv = this.Point3Dto2D(-TextSize,-TextSize,-TextSize+MaxZ);
            u = uv[0];
            v = uv[1];
            if (isDrawTextZ)
			  ctx.fillText("Z",u,v);        
            //
            if (0) //HTML5 LOGO
            {
                TextSize = 25;
                ctx.font = "" + TextSize + "pt bold Arial";
                ctx.fillStyle = "rgb(240,240,240)";
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';		  
                ctx.fillText("HTML5",0,0);
            }  
            
            ctx.restore();
        }
*/

    }
}
//----------------------------------------------------------------------------
// Ziyur Teyva
Draw3D.prototype.Cubiod = function(mx,my,mz, LX,LY,LZ, color)
{
    //Draw 3D Cubiod (hebrew: Teyva)
    //ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);
    if (1)
    {
       //indexes
       var x=0; 
       var y=1;
       var z=2;
       //
       //L=Length
       //var LX = this.ScaleX * 3;  
       //var LY = this.ScaleY * 2;  
       //var LZ = this.ScaleZ * 1;  
       //var LX = 120;  
       //var LY = 80;  
       //var LZ = 60;  
       //
       //M=Move
       var MX = mx;
       var MY = my;
       var MZ = mz;
       //
       //
       var a = [MX+0,MY+0,MZ+0];
       var b = [MX+0,MY+LY,MZ+0];
       var c = [MX+0,MY+LY,MZ+LZ];
       var d = [MX+0,MY+0,MZ+LZ];
       var e = [MX-LX,MY+0,MZ+LZ];
       var f = [MX-LX,MY+LY,MZ+LZ];
       var g = [MX-LX,MY+LY,MZ+0];
       var h = [MX-LX,MY+0,MZ+0];

       if (1)
       {
           //-----------------------------
           //draw x,y,z axis
           //-----------------------------
           //Draw3D_Axis(ctx, angle, "black","black","black");
       }
       
       //Draw Cuboid
       if (1)
       {
           if (1)
           {
               //-----------------------------
               //draw invisible lines
               //-----------------------------
               //FG
							 color = 'black';
               this.Line( f[x],f[y],f[z], g[x],g[y],g[z], color);
               //GB
               this.Line( g[x],g[y],g[z], b[x],b[y],b[z], color);
               //GH
               this.Line( g[x],g[y],g[z], h[x],h[y],h[z], color);
           }
           
           if (1)
           {
               //-----------------------------
               //draw visible lines
               //-----------------------------
               //AB
               this.Line( a[x],a[y],a[z], b[x],b[y],b[z], color);
               //BC
               this.Line( b[x],b[y],b[z], c[x],c[y],c[z], color);
               //CD
               this.Line( c[x],c[y],c[z], d[x],d[y],d[z], color);
               //DA
               this.Line( d[x],d[y],d[z], a[x],a[y],a[z], color);
               //CF
               this.Line( c[x],c[y],c[z], f[x],f[y],f[z], color);
               //FE
               this.Line( f[x],f[y],f[z], e[x],e[y],e[z], color);
               //ED
               this.Line( e[x],e[y],e[z], d[x],d[y],d[z], color);
               //EH
               this.Line( e[x],e[y],e[z], h[x],h[y],h[z], color);
               //HA
               this.Line( h[x],h[y],h[z], a[x],a[y],a[z], color);
               //
               
           }

///*
           if (1)
           {
               //-----------------------------
               //draw sides
               //-----------------------------
               //FGHE
               this.Quadrangle( f[x],f[y],f[z], g[x],g[y],g[z],
                                h[x],h[y],h[z], e[x],e[y],e[z],
                                color, "pink");
           
               //ABCD
               this.Quadrangle( a[x],a[y],a[z], b[x],b[y],b[z],
                                c[x],c[y],c[z], d[x],d[y],d[z],
                                color, "yellow");
               //ADEH
               this.Quadrangle( a[x],a[y],a[z], d[x],d[y],d[z],
                                e[x],e[y],e[z], h[x],h[y],h[z],
                                color, "red");
               //CFED
               this.Quadrangle( c[x],c[y],c[z], f[x],f[y],f[z],
                                e[x],e[y],e[z], d[x],d[y],d[z],
                                color, "lightgreen");
           }
//*/  
       }

    }
}
//----------------------------------------------------------------------------
// Draw3D_Quadrangle  (hebrew: Ziyur Meruba)
Draw3D.prototype.Quadrangle = function( x1,y1,z1,  x2,y2,z2,  
                                        x3,y3,z3,  x4,y4,z4 , 
                                        strokeColor, fillColor)

{
    var cv = 0; //this.cv;
    var cu = 0; //this.cu;
    
    var uv1 = this.Point3Dto2D(x1,y1,z1);
    var uv2 = this.Point3Dto2D(x2,y2,z2);
    var uv3 = this.Point3Dto2D(x3,y3,z3);
    var uv4 = this.Point3Dto2D(x4,y4,z4);
    
    var u1 = cu + uv1[0];
    var v1 = cv + uv1[1];
    var u2 = cu + uv2[0];
    var v2 = cv + uv2[1];
    var u3 = cu + uv3[0];
    var v3 = cv + uv3[1];
    var u4 = cu + uv4[0];
    var v4 = cv + uv4[1];
      
    Draw2D_Quadrangle(this.ctx, u1,v1, u2,v2, u3,v3, u4,v4 ,strokeColor, fillColor);

}
//--------------------------------------------------------------------------
Draw3D.prototype.Triangle = function ( x1,y1,z1,  x2,y2,z2,  x3,y3,z3, 
                                       strokeColor, fillColor)
{
    var cv = 0;//this.cv;
    var cu = 0;//this.cu;
    
    var uv1 = this.Point3Dto2D(x1,y1,z1);
    var uv2 = this.Point3Dto2D(x2,y2,z2);
    var uv3 = this.Point3Dto2D(x3,y3,z3);
    
    var u1 = cu + uv1[0];
    var v1 = cv + uv1[1];
    var u2 = cu + uv2[0];
    var v2 = cv + uv2[1];
    var u3 = cu + uv3[0];
    var v3 = cv + uv3[1];
      
    Draw2D_Triangle(this.ctx, u1,v1,u2,v2,u3,v3 ,strokeColor, fillColor);

}
//--------------------------------------------------------------------------
Draw3D.prototype.Tetrahedron = function(mx,my,mz, LX,LY,LZ, color) //move x,y,z
{
}
//--------------------------------------------------------------------------
Draw3D.prototype.Pyramid = function(mx,my,mz, LX,LY,LZ, color) //move x,y,z 
{
    if (1)
    {
       //indexes
       var x=0; 
       var y=1;
       var z=2;
       //
       //L=Length
       //var LX = 80;  
       //var LY = 80;  
       //var LZ = 80;  
       //
       //M=Move
       var MX = mx;
       var MY = my;
       var MZ = mz;
       //
       //
       var a = [MX+0,MY+0,MZ+0];
       var b = [MX+0,MY+LY,MZ+0];
       var c = [MX-LX,MY+LY,MZ+0];
       var d = [MX-LX,MY+0,MZ+0];
       var e = [MX-LX/2,MY+LX/2,MZ+LZ];
       
       //Draw Shape
       if (1)
       {
           if (1)
           {
               //-----------------------------
               //draw invisible lines
               //-----------------------------
               //BC
               this.Line( b[x],b[y],b[z], c[x],c[y],c[z], color);
               //CD
               this.Line( c[x],c[y],c[z], d[x],d[y],d[z], color);
               //EC
               this.Line( e[x],e[y],e[z], c[x],c[y],c[z], color);
           }
           
           if (1)
           {
               //-----------------------------
               //draw visible lines
               //-----------------------------
               //DA
               this.Line( d[x],d[y],d[z], a[x],a[y],a[z], color);
               //AB
               this.Line( a[x],a[y],a[z], b[x],b[y],b[z], color);
               //EB
               this.Line( e[x],e[y],e[z], b[x],b[y],b[z], color);
               //EA
               this.Line( e[x],e[y],e[z], a[x],a[y],a[z], color);
               //ED
               this.Line( e[x],e[y],e[z], d[x],d[y],d[z], color);
           }
           
           if (1) 
           {
               //-----------------------------
               //draw sides
               //-----------------------------
               //unvisible
               //BEC
               this.Triangle( b[x],b[y],b[z],  e[x],e[y],e[z],  c[x],c[y],c[z], color, "orange");
               //CED
               this.Triangle( c[x],c[y],c[z],  e[x],e[y],e[z],  d[x],d[y],d[z], color, "green");
               
               //visible
               //ABE
               this.Triangle( a[x],a[y],a[z],  b[x],b[y],b[z],  e[x],e[y],e[z], color, "yellow");
               //ADE
               this.Triangle( a[x],a[y],a[z],  d[x],d[y],d[z],  e[x],e[y],e[z], color, "lightblue");
               
           }
           
       }

    }
}
//----------------------------------------------------------------------------
Draw3D.prototype.Circle = function(mx,my,mz, r, color)
{
    var x,y,z,r,rr,q;
    var xr,yr,zr;
    var x0,y0,z0,r0;
    var step = 1;

    if (1)
    {
        for (x=-r; x <=r; x += step)
        {
            var yy = r*r - x*x;
            y = Math.sqrt(yy);
            z = 0; 
            if (x == -r)
            {
                x0 = x;
                y0 = y;
                z0 = z;
            }
            else
            {
               var mycolor = color;
               
               //z = 0; z0 = 0;
               //bottom circle
               this.Line( mx+x,my+y,mz+z, mx+x0,my+y0,mz+z0, mycolor);
               this.Line( mx-x,my-y,mz+z, mx-x0,my-y0,mz+z0, mycolor);
               
            }
            
            x0 = x;
            y0 = y;
            z0 = z;
            
           
        }
    }
}
//----------------------------------------------------------------------------
Draw3D.prototype.Cylinder = function(mx,my,mz, r,h, color)
{
    var x,y,z,r,rr;
    var xr,yr,zr;
    var x0,y0,z0,r0;
    var step = 1;

    z = h;
    if (1)
    {
        for (x=-r; x <=r; x += step)
        {
            var yy = r*r - x*x;
            y = Math.sqrt(yy);
            if (x == -r)
            {
                x0 = x;
                y0 = y;
                z0 = z;
            }
            else
            {
               var mycolor = color;
               
               //bottom circle
               z = 0; z0 = 0;
               this.Line( mx+x,my+y,mz+z, mx+x0,my+y0,mz+z0, mycolor);
               this.Line( mx-x,my-y,mz+z, mx-x0,my-y0,mz+z0, mycolor);
               
               //top circle
               z = h; z0 = h;
               this.Line( mx+x,my+y,mz+z, mx+x0,my+y0,mz+z0, mycolor);
               this.Line( mx-x,my-y,mz+z, mx-x0,my-y0,mz+z0, mycolor);
               
               //z = h;
               //cone (conus)
               //this.Line( mx+x,my+y,mz+0, mx+0,my+0,mz+z, mycolor);
               //this.Line( mx-x,my-y,mz+0, mx-0,my-0,mz+z, mycolor);
               
               //cylinder
               //mycolor = "lightblue";
               this.Line( mx+x,my+y,mz+0, mx+x,my+y,mz+z, mycolor);
               this.Line( mx-x,my-y,mz+0, mx-x,my-y,mz+z, mycolor);
               
            }
            
            x0 = x;
            y0 = y;
            z0 = z;
            
           
        }
    }

}
//----------------------------------------------------------------------------
Draw3D.prototype.Conus = function(mx,my,mz, r,h, color)
{
    //mx,my,mz are the center of the cone (conus)
    var x,y,z,r,rr;
    var xr,yr,zr;
    var x0,y0,z0,r0;
    var step = 1;

    z = h;
    if (1)
    {
        for (x=-r; x <=r; x += step)
        {
            var yy = r*r - x*x;
            y = Math.sqrt(yy);
            if (x == -r)
            {
                x0 = x;
                y0 = y;
                z0 = z;
            }
            else
            {
               var mycolor = color;
               
               z = 0; z0 = 0;
               //bottom circle
               this.Line( mx+x,my+y,mz+z, mx+x0,my+y0,mz+z0, mycolor);
               this.Line( mx-x,my-y,mz+z, mx-x0,my-y0,mz+z0, mycolor);
               
               z = h;
               //cone
               this.Line( mx+x,my+y,mz+0, mx+0,my+0,mz+z, mycolor);
               this.Line( mx-x,my-y,mz+0, mx-0,my-0,mz+z, mycolor);
               
            }
            
            x0 = x;
            y0 = y;
            z0 = z;
            
           
        }
    }
}
//----------------------------------------------------------------------------
Draw3D.prototype.Sphere = function(mx,my,mz, r, color)
{

    var x,y,z,r,rr,q;
    var xr,yr,zr;
    var x0=0,y0=0,z0=0,r0;
    var step = r/50;

    //this.Circle(mx,my,mz, r, color);

    var x0=0;
    var y0=0;
    var z0=0;
    if (1)
    {
        for (y=-r; y <=r; y += step)
        {
            for (x=-r; x <=r; x += step)
            {
                var zz = r*r - x*x - y*y;
                if (zz >= 0)
                  z = Math.sqrt(zz);
                else 
                  z = 0;
                //if (x == -r && y == -r)
                //{
                //    x0 = x;
                //    y0 = y;
                //    z0 = z;
                //}
                //else
                {
                   var mycolor = color;
                   
                   if (zz >= 0)
                   {
                       this.Line( mx+x,my+y,mz+z, mx+x0,my+y0,mz+z0, mycolor);
                       //this.Line( mx-x,my-y,mz+z, mx-x0,my-y0,mz+z0, mycolor);

                       this.Line( mx+x,my+y,mz-z, mx+x0,my+y0,mz-z0, mycolor);
                       //this.Line( mx+x,my+y,mz+z, mx+x0,my+y0,mz-z0, mycolor);
                       //this.Line( mx-x,my-y,mz+z, mx-x0,my-y0,mz-z0, mycolor);
                   }
                }
                
                x0 = x;
                y0 = y;
                z0 = z;
                
               
            }
        }
    }


}
//----------------------------------------------------------------------------
Draw3D.prototype.Prisma = function (mx,my,mz, cx,cy,cz, r,sides, color, fillColor)
{
    //a prism (English:prism; Greek:prisma; Hebrew:minsara) is a polyhedron with an 
    //n-sided polygonal base, a translated copy.
    //e.g.: sides=4 - Cube (Hebrew: Cubiya)
    //
    var xy_arr = Draw2D_GetShapePointsArray(cx,cy,r,sides);
    var x0 = xy_arr[0];
    var y0 = xy_arr[1];
    var z0 = cz;
    var x1,y1,z1,x2,y2,z2;
    
    var j = 0;
    var i;    
    for (i=0; i < sides; i++)
    {
       x1 = xy_arr[j];
       y1 = xy_arr[j+1];
       z1 = z0;     

       x2 = xy_arr[j+2];
       y2 = xy_arr[j+3];
       z2 = z0;

       this.Line( mx+x1,my+y1,mz+0, mx+x2,my+y2,mz+0, color);
       this.Line( mx+x1,my+y1,mz+z1, mx+x2,my+y2,mz+z2, color);
       this.Line( mx+x2,my+y2,mz+0, mx+x2,my+y2,mz+z2, color);
       
       j += 2;
    }
    this.Line( mx+x2,my+y2,mz+0, mx+x0,my+y0,mz+0, color);
    this.Line( mx+x2,my+y2,mz+z2, mx+x0,my+y0,mz+z0, color);
    this.Line( mx+x0,my+y0,mz+0, mx+x0,my+y0,mz+z0, color);
    
    if (fillColor != "nofill")
    {
       var array_xyz = new Array();
       var total_xyz = 0;
       //draw & paint sides
       j = 0;
       for (i=0; i < sides+1; i++)
       {
           var a = [ xy_arr[j+0], xy_arr[j+1], 0 ];
           var b = [ xy_arr[j+2], xy_arr[j+3], 0 ];
           var c = [ xy_arr[j+2], xy_arr[j+3], z0 ];
           var d = [ xy_arr[j+0], xy_arr[j+1], z0 ];       
           this.Quadrangle( mx+a[0],my+a[1],mz+a[2], 
                            mx+b[0],my+b[1],mz+b[2],
                            mx+c[0],my+c[1],mz+c[2], 
                            mx+d[0],my+d[1],mz+d[2],
                            color, fillColor);
           
           array_xyz[3*i+0] = mx + xy_arr[j+0];
           array_xyz[3*i+1] = my + xy_arr[j+1];
           array_xyz[3*i+2] = mz + z0;
           
           j += 2;
       }
       array_xyz[3*i+0] = mx + xy_arr[0];
       array_xyz[3*i+1] = my + xy_arr[1];
       array_xyz[3*i+2] = mz + z0;
       
       total_xyz = sides+1;
       this.DrawShapeByArrayXYZ(array_xyz,total_xyz, color, fillColor);
       
    }
}
//----------------------------------------------------------------------------
Draw3D.prototype.PrismaTruncated = function (mx,my,mz, cx,cy,cz, r,sides, color, fillColor)
{
    //
    var xy_arr = Draw2D_GetShapePointsArray(cx,cy,r,sides);
    var xy_arr_top = Draw2D_GetShapePointsArray(cx,cy,r/3,sides);
    var x0 = xy_arr[0];
    var y0 = xy_arr[1];
    var z0 = cz;
    var xtop0 = xy_arr_top[0];
    var ytop0 = xy_arr_top[1];
    var ztop0 = cz;
    var x1,y1,z1,x2,y2,z2,x3,y3,z3,x4,y4,z4;
    
    var j = 0;
    var i;    
    for (i=0; i < sides; i++)
    {
       x1 = xy_arr[j];
       y1 = xy_arr[j+1];
       z1 = 0;     

       x2 = xy_arr[j+2];
       y2 = xy_arr[j+3];
       z2 = 0;

       x3 = xy_arr_top[j];
       y3 = xy_arr_top[j+1];
       z3 = z0;     

       x4 = xy_arr_top[j+2];
       y4 = xy_arr_top[j+3];
       z4 = z0;
       
       this.Line( mx+x1,my+y1,mz+0, mx+x2,my+y2,mz+0, color);
       this.Line( mx+x3,my+y3,mz+z3, mx+x4,my+y4,mz+z4, color);
       this.Line( mx+x1,my+y1,mz+z1, mx+x3,my+y3,mz+z3, color);
       
       j += 2;
    }
    this.Line( mx+x2,my+y2,mz+0, mx+x0,my+y0,mz+0, color);
    this.Line( mx+x4,my+y4,mz+z4, mx+xtop0,my+ytop0,mz+ztop0, color);
    this.Line( mx+x2,my+y2,mz+z2, mx+x4,my+y4,mz+z4, color);
    
    if (fillColor != "nofill")
    {
       var array_xyz = new Array();
       var total_xyz = 0;
       //var array_xyz_top = new Array();
       //var total_xyz_top = 0;
       //draw & paint sides
       j = 0;
       for (i=0; i < sides+1; i++)
       //for (i=0; i < 3; i++)
       {
           var a = [ xy_arr[j+0], xy_arr[j+1], 0 ];
           var b = [ xy_arr[j+2], xy_arr[j+3], 0 ];
           var c = [ xy_arr_top[j+2], xy_arr_top[j+3], z0 ];       
           var d = [ xy_arr_top[j+0], xy_arr_top[j+1], z0 ];
           this.Quadrangle( mx+a[0],my+a[1],mz+a[2], 
                            mx+b[0],my+b[1],mz+b[2],
                            mx+c[0],my+c[1],mz+c[2], 
                            mx+d[0],my+d[1],mz+d[2],
                            color, fillColor);
           //top
           array_xyz[3*i+0] = mx + xy_arr_top[j+0];
           array_xyz[3*i+1] = my + xy_arr_top[j+1];
           array_xyz[3*i+2] = mz + z0;
           
           j += 2;
       }
       array_xyz[3*i+0] = mx + xy_arr_top[0];
       array_xyz[3*i+1] = my + xy_arr_top[1];
       array_xyz[3*i+2] = mz + z0;
       
       total_xyz = sides+1;
       this.DrawShapeByArrayXYZ(array_xyz,total_xyz, color, fillColor);
       
    }
}
//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
Draw3D.prototype.PrismaConus = function (mx,my,mz, cx,cy,cz, r,sides, color, fillColor)
{
    //a prism (English:prism; Greek:prisma; Hebrew:minsara) is a polyhedron with an 
    //n-sided polygonal base, a translated copy.
    //e.g.: sides=4 - Cube (Hebrew: Cubiya)
    //
    var xy_arr = Draw2D_GetShapePointsArray(cx,cy,r,sides);
    var x0 = xy_arr[0];
    var y0 = xy_arr[1];
    var z0 = cz;
    var x1,y1,z1,x2,y2,z2;
    
    var j = 0;
    var i;    
    for (i=0; i < sides; i++)
    {
       x1 = xy_arr[j];
       y1 = xy_arr[j+1];
       z1 = z0;     

       x2 = xy_arr[j+2];
       y2 = xy_arr[j+3];
       z2 = z0;

       this.Line( mx+x1,my+y1,mz+0, mx+x2,my+y2,mz+0, color);
       //this.Line( mx+x1,my+y1,mz+z1, mx+x2,my+y2,mz+z2, color);
       this.Line( mx+x2,my+y2,mz+0, mx+cx,my+cy,mz+cz, color);
       
       j += 2;
    }
    this.Line( mx+x2,my+y2,mz+0, mx+x0,my+y0,mz+0, color);
    //this.Line( mx+x2,my+y2,mz+z2, mx+x0,my+y0,mz+z0, color);
    //this.Line( mx+x0,my+y0,mz+0, mx+cx,my+cy,mz+cz, color);
    
    if (fillColor != "nofill")
    {
       //draw & paint sides
       j = 0;
       for (i=0; i < sides+1; i++)
       {
           //        
           var a = [ xy_arr[j+0], xy_arr[j+1], 0 ];
           var b = [ xy_arr[j+2], xy_arr[j+3], 0 ];
           var c = [ cx, cy, cz ];
           this.Triangle( mx+a[0],my+a[1],mz+a[2], 
                          mx+b[0],my+b[1],mz+b[2],
                          mx+c[0],my+c[1],mz+c[2], 
                          color, fillColor);
           
           j += 2;
       }
       
    }
}
//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
Draw3D.prototype.SinRR_RR = function(mx,my,mz, color)
{
    var cx = 400;
    var cy = 400;
    var i;
    var x,y,z,r,rr,q;
    var xr,yr,zr;
    var x0,y0,z0,r0;
    var step = 10;
    
    var maxy = 360;
    var maxx = 360;
    
    for (y=-maxy; y <=maxy; y += step)
    {
        for (x=-maxx; x <=maxx; x += step)
        {
            xr = 0.5*x*Math.PI/180;
            yr = 0.5*y*Math.PI/180;
            
            rr = (xr*xr + yr*yr);
            r = Math.sqrt(rr);
            if (rr == 0)
              zr = 1;
            else              
              zr = 1*Math.sin(rr) / rr;
            
            
            if (x == -360 && y == -360)
            {
            }
            else
            {
               var mycolor = color;
               var s1 = 50;
               var s2 = 80;
               this.Line(mx+s1*xr,my+s1*yr,mz+s2*zr, mx+s1*x0,my+s1*y0,mz+s2*z0,  mycolor);
               
            }
            
            x0 = xr;
            y0 = yr;
            z0 = zr;
            
           
        }
    }

}
//----------------------------------------------------------------------------
Draw3D.prototype.DrawFree = function(mx,my,mz, funcName, color)
{
    //is z = f(x,y)   f=funcName
    var x,y,z;
    var x0,y0,z0;
    var step = 10;
    
    var miny = this.MinY;
    var maxy = this.MaxY;
    var minx = this.MinX;
    var maxx = this.MaxX;
    
    for (y=miny; y <=maxy; y += step)
    {
        for (x=minx; x <=maxx; x += step)
        {
            if (funcName)
            {
               z = funcName(x,y);
            } 
            else
            {
               z = 0;
            }
            
            if (x == minx && y == miny)
            {
            }
            else
            {
               this.Line(mx+x,my+y,mz+z, mx+x0,my+y0,mz+z0, color);
               //this.Line(mx+x0,my+y0,mz+z0, mx+x,my+y,mz+z, color);
            }
            
            x0 = x;
            y0 = y;
            z0 = z;
        }
    }

}
//----------------------------------------------------------------------------
Draw3D.prototype.DrawShapeByArrayXYZ = function(array_xyz, total_xyz , strokeColor, fillColor)
{
    var ctx = this.ctx;
    ctx.save();   
    if (fillColor != "nofill")
    {
       ctx.lineWidth = 1;
       ctx.fillStyle = fillColor;
       ctx.strokeStyle = strokeColor;
       ctx.beginPath();

       var j = 0;
       var a = [ array_xyz[j+0], array_xyz[j+1], array_xyz[j+2] ];
       var uv = this.Point3Dto2D(a[0],a[1],a[2]); 
       ctx.moveTo(uv[0],uv[1]);
       j += 3;
       for (i=1; i < total_xyz; i++)
       {
           var b = [ array_xyz[j+0], array_xyz[j+1], array_xyz[j+2] ];
           var uv2 = this.Point3Dto2D(b[0],b[1],b[2]); 
           ctx.lineTo(uv2[0],uv2[1]);
           j += 3;
       }
       ctx.lineTo(uv[0],uv[1]);
       ctx.fill();
       ctx.stroke();
       ctx.closePath();       
    }
    ctx.restore();
 
}
//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
//Changes
Draw3D.prototype.CuboidDivided = function(mx,my,mz, LX,LY,LZ, color, num_questions_x, num_questions_y, num_questions_z, dot_x, dot_y, dot_z)
{
    //Draw 3D Cubiod (hebrew: Teyva)
    //ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);
    if (1)
    {
       //indexes
       var x=0; 
       var y=1;
       var z=2;
       //
       //L=Length
       //var LX = this.ScaleX * 3;  
       //var LY = this.ScaleY * 2;  
       //var LZ = this.ScaleZ * 1;  
       //var LX = 120;  
       //var LY = 120;  
       //var LZ = 120;
       var interval_x = LX / num_questions_x;
       var interval_y = LY / num_questions_y;
       var interval_z = LZ / num_questions_z;
       //console.log({i_x: interval_x, i_y: interval_y, i_z: interval_z})
       //
       //M=Move
///*
       var MX = mx;
       var MY = my;
       var MZ = mz;
       //console.log({move_x: MX, move_y: MY, move_z: MZ})
       //console.log({LX: LX, LY: LY, LZ: LZ})
//*/

       //
       //
/*
       var a = [MX+0,MY+0,MZ+0];
       var b = [MX+0,MY+LY,MZ+0];
       var c = [MX+0,MY+LY,MZ+LZ];
       var d = [MX+0,MY+0,MZ+LZ];
       var e = [MX-LX,MY+0,MZ+LZ];
       var f = [MX-LX,MY+LY,MZ+LZ];
       var g = [MX-LX,MY+LY,MZ+0];
       var h = [MX-LX,MY+0,MZ+0];
*/
			 var a = [0, 0, 0];
       var b = [0, LY, 0];
       var c = [0, LY, LZ];
       var d = [0, 0, LZ];
       var e = [LX, 0, LZ];
       var f = [LX, LY, LZ];
       var g = [LX, LY, 0];
       var h = [LX, 0, 0];
       //console.log({a: a, b: b, c: c, d: d, e: e, f: f, g: g, h: h})

       if (1)
       {
           //-----------------------------
           //draw x,y,z axis
           //-----------------------------
           //Draw3D_Axis(ctx, angle, "black","black","black");
       }
       
       //Draw Cuboid
       if (1)
       {
       		 
///*
       		 color = '#666';
       		 
       		 var i, i2, i3;
       		 for(i2 = 0; i2.toFixed(2) <= LZ; i2 = i2+interval_z){
		     		 for(i = 0; i.toFixed(2) <= LX; i = i+interval_x){
		         		this.Line( i,a[y],i2, i,b[y],i2, color);
                //console.log('punto: [' + i +', ' + a[y] + ', '+ i2 +'] + [' + i + ', ' + b[y] + ', ' + i2 + ']');
		     		 }
		     		 for(i = 0; i.toFixed(2) <= LY; i = i+interval_y){
		         		this.Line(h[x],i,i2, a[x],i,i2, color);
		     		 }
		     	 }
		     	 
		     	 
		     	 for(i = 0; i.toFixed(2) <= LX; i = i+interval_x){
		     	 	 for(i2 = 0; i2.toFixed(2) <= LY; i2 = i2+interval_y){
		     	 	 		this.Line( i,i2,0, i,i2,LZ, color);
		     	 	 }
		     	 }
		     	 
///* Show way
					 var border_line_weight = 3;
       		 var color_line = 'black'
					 var count = 0;
					 var cube3d = this;
					 for(i = 0; i.toFixed(2) < LX; i = i+interval_x){
					 		var color2 = 'red';
					 		if (dot_x == count){
					 			break;
					 		} else{
					 			cube3d.LineCustom( i,h[y],h[z], i+interval_x,a[y],a[z], color_line, border_line_weight);
					 		}
					 		count++;
					 }
					 
					 count = 0;
					 for(i2 = 0; i2.toFixed(2) < LY; i2 = i2+interval_y){
					 		var color2 = 'red';
					 		//console.log({dot: dot_y, count: count})
					 		if (dot_y == count){
					 			break;
					 		} else{
					 			//this.Line( i+interval_x,h[y],h[z], i+interval_x,a[y],a[z], color2);
					 			this.LineCustom( i,i2,a[z], i,i2+interval_y,b[z], color_line, border_line_weight);
					 		}
					 		count++;
					 }
					 
					 count = 0;
					 for(i3 = 0; i3.toFixed(2) < LZ; i3 = i3+interval_z){
					 		var color2 = 'red';
					 		//console.log({dot: dot_z, count: count})
					 		if (dot_z == count){
					 			break;
					 		} else{
					 			this.LineCustom( i,i2,i3, i,i2,i3+interval_z, color_line, border_line_weight);
					 		}
					 		count++;
					 }
					 
					 g_ctx3d.DrawPoint(interval_x*dot_x, interval_y*dot_y, interval_z*dot_z, color);
					 
					 
//*/
///*
							//this.Line( a[x],a[y],a[z], b[x],b[y],b[z], color2);
              //this.Line( b[x],b[y],b[z], c[x],c[y],c[z], color2);
              //this.Line( c[x],c[y],c[z], d[x],d[y],d[z], color2);
              //this.Line( d[x],d[y],d[z], a[x],a[y],a[z], color2);
              //this.Line( c[x],c[y],c[z], f[x],f[y],f[z], color2);
              //this.Line( f[x],f[y],f[z], e[x],e[y],e[z], color2);
              //this.Line( e[x],e[y],e[z], d[x],d[y],d[z], color2);
              //this.Line( e[x],e[y],e[z], h[x],h[y],h[z], color2);
            	//this.Line( h[x],h[y],h[z], a[x],a[y],a[z], color2);
              //this.Line( f[x],f[y],f[z], g[x],g[y],g[z], color2);
              //this.Line( g[x],g[y],g[z], b[x],b[y],b[z], color2);
              //this.Line( g[x],g[y],g[z], h[x],h[y],h[z], color2);
//*/
		     	 
		     	 
//*/
					 //this.DrawPoint(x,y,z, color);
/*
       		 //GB
           this.Line( g[x],g[y],g[z], b[x],b[y],b[z], color);
           //GH
           this.Line( g[x],g[y],g[z], h[x],h[y],h[z], color);
           //AB
           this.Line( a[x],a[y],a[z], b[x],b[y],b[z], color);
           //HA
           this.Line( h[x],h[y],h[z], a[x],a[y],a[z], color);
*/
/*       		 
           if (1)
           {

               //-----------------------------
               //draw invisible lines
               //-----------------------------
               //FG
               this.Line( f[x],f[y],f[z], g[x],g[y],g[z], color);
               //GB
               this.Line( g[x],g[y],g[z], b[x],b[y],b[z], color);
               //GH
               this.Line( g[x],g[y],g[z], h[x],h[y],h[z], color);

           }
*/           
/*
           if (1)
           {

               //-----------------------------
               //draw visible lines
               //-----------------------------
               //AB
               //console.log('punto1: [' + a[x]+', ' + a[y] + ', '+ a[z]+'] + [' + b[x]+', '+b[y]+', '+b[z]+']');
               this.Line( a[x],a[y],a[z], b[x],b[y],b[z], color);
               //BC
               this.Line( b[x],b[y],b[z], c[x],c[y],c[z], color);
               //CD
               this.Line( c[x],c[y],c[z], d[x],d[y],d[z], color);
               //DA
               this.Line( d[x],d[y],d[z], a[x],a[y],a[z], color);
               //CF
               this.Line( c[x],c[y],c[z], f[x],f[y],f[z], color);
               //FE
               this.Line( f[x],f[y],f[z], e[x],e[y],e[z], color);
               //ED
               this.Line( e[x],e[y],e[z], d[x],d[y],d[z], color);
               //EH
               this.Line( e[x],e[y],e[z], h[x],h[y],h[z], color);
               //HA
               this.Line( h[x],h[y],h[z], a[x],a[y],a[z], color);
               //

               
           }
*/
///*
           if (1)
           {
               //-----------------------------
               //draw sides
               //-----------------------------
							                //FGHE
               this.Quadrangle( f[x],f[y],f[z], g[x],g[y],g[z],
                                h[x],h[y],h[z], e[x],e[y],e[z],
                                color, "#428bca");
           
               //ABCD
               this.Quadrangle( a[x],a[y],a[z], b[x],b[y],b[z],
                                c[x],c[y],c[z], d[x],d[y],d[z],
                                color, "#f0ad4e");
               //ADEH
               this.Quadrangle( a[x],a[y],a[z], d[x],d[y],d[z],
                                e[x],e[y],e[z], h[x],h[y],h[z],
                                color, "#d9534f");
               //CFED
               this.Quadrangle( c[x],c[y],c[z], f[x],f[y],f[z],
                                e[x],e[y],e[z], d[x],d[y],d[z],
                                color, "#5cb85c");  
               /*
               //FGHE
               this.Quadrangle( f[x],f[y],f[z], g[x],g[y],g[z],
                                h[x],h[y],h[z], e[x],e[y],e[z],
                                color, "pink");
           
               //ABCD
               this.Quadrangle( a[x],a[y],a[z], b[x],b[y],b[z],
                                c[x],c[y],c[z], d[x],d[y],d[z],
                                color, "yellow");
               //ADEH
               this.Quadrangle( a[x],a[y],a[z], d[x],d[y],d[z],
                                e[x],e[y],e[z], h[x],h[y],h[z],
                                color, "red");
               //CFED
               this.Quadrangle( c[x],c[y],c[z], f[x],f[y],f[z],
                                e[x],e[y],e[z], d[x],d[y],d[z],
                                color, "lightgreen");  
               */
           }
//*/
       }

    }
}
Draw3D.prototype.DrawPoint = function(x,y,z, color){
	 //this.Line(x,y,z,x,y,z, color);
    //center
/*
    console.log('X: ' + x + ', Y: ' + y + ', Z: ' + z );
    console.log('hi!');
    console.log(this.ctx);
    console.log(this);
*/
    var border_weight = 5;
    var cv = 0; //this.cv;
    var cu = 0; //this.cu;
    
    var u1,u2;
    var v1,v2;
    
    if (1)
    {
        var uv = [0,0];
        uv = this.Point3Dto2D(x-(border_weight/2),y-(border_weight/2),z);
        u1 = uv[0];
        v1 = uv[1];
        uv = this.Point3Dto2D(x+(border_weight/2),y+(border_weight/2),z);
        u2 = uv[0];
        v2 = uv[1];
    }
    
    if (1)
    {
        Draw2D_Point(this.ctx,cu+u1,cv+v1,cu+u2,cv+v2, color, border_weight);
    }	
}
//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
Draw3D.prototype.FunctionZYX = function(mx,my,mz, funcName, color)
{
}
//----------------------------------------------------------------------------
//Draw3D Move functions
//----------------------------------------------------------------------------
Draw3D.prototype.RotateX = function(angle)
{
   this.AngleX += angle;
}
//----------------------------------------------------------------------------
Draw3D.prototype.RotateY = function(angle)
{
   this.AngleY += angle;
}
//----------------------------------------------------------------------------
Draw3D.prototype.RotateZ = function(angle)
{
   this.AngleZ += angle;
}
//----------------------------------------------------------------------------
Draw3D.prototype.RotateZFix = function(angle)
{
   this.AngleZ = angle;
}
//----------------------------------------------------------------------------
Draw3D.prototype.RotatePOV = function(angle)  //Point Of View
{
   this.AngleX += angle/2;
   this.AngleY -= angle/2;
}
//----------------------------------------------------------------------------
Draw3D.prototype.ResetAngles = function()
{
   this.RADIANS = 0;   
   this.DEGREES = 360;  
   this.AngleUnits = this.DEGREES;
   this.SetAngleX(-15);
   this.SetAngleY(15);
   this.SetAngleZ(90);
}
//----------------------------------------------------------------------------
Draw3D.prototype.SetAngleX = function(angle)
{
   this.AngleX = angle;
}
//----------------------------------------------------------------------------
Draw3D.prototype.SetAngleY = function(angle)
{
   this.AngleY = angle;
}
//----------------------------------------------------------------------------
Draw3D.prototype.SetAngleZ = function(angle)
{
   this.AngleZ = angle;
}
//----------------------------------------------------------------------------
Draw3D.prototype.ZoomTo = function(value)
{
   this.Zoom = value;
}
//----------------------------------------------------------------------------
Draw3D.prototype.ZoomBy = function(value)
{
   this.Zoom *= value;
}
//----------------------------------------------------------------------------
Draw3D.prototype.ZoomOut = function()
{
   var d = 1/1.1;
   this.ZoomBy(d); 
}
//----------------------------------------------------------------------------
Draw3D.prototype.ZoomIn = function()
{
   var d = 1.1;
   this.ZoomBy(d); 
}
//----------------------------------------------------------------------------
Draw3D.prototype.ViewTopZ = function()
{
   this.ViewX = 1;
   this.ViewY = 1;
   this.ViewZ = 0;

   this.AngleX = 0;
   this.AngleY = 90;
   this.AngleZ = 90;
}
//----------------------------------------------------------------------------
Draw3D.prototype.ViewTopY = function()
{
   this.ViewX = 1;
   this.ViewY = 0;
   this.ViewZ = 1;
   
   this.AngleX = 0;
   this.AngleY = 0;
   this.AngleZ = 90;
   //this.AngleX = -45;
   //this.AngleY = 45;
   //this.AngleZ = 45;

   this.isDrawGridZ = true;
   
}
//----------------------------------------------------------------------------
Draw3D.prototype.ViewTopX = function()
{
   this.ViewX = 0;
   this.ViewY = 1;
   this.ViewZ = 1;
   
   this.AngleX = 0;
   this.AngleY = 0;
   this.AngleZ = 90;

   this.isDrawGridZ = true;
   
}
//----------------------------------------------------------------------------
Draw3D.prototype.View3D = function()
{
   this.ViewX = 1;
   this.ViewY = 1;
   this.ViewZ = 1;

   this.AngleX = -15;
   this.AngleY = 15;
   this.AngleZ = 90;

   this.isDrawGridZ = false;
   
}
//----------------------------------------------------------------------------


//----------------------------------------------------------------------------
//some service functions
//----------------------------------------------------------------------------
function rad(angle_degrees)
{
   var alpha = angle_degrees * Math.PI / 180;
   return alpha;
}
//----------------------------------------------------------------------------
function deg(angle_radians)
{
   var alpha = angle_radians * 180 / Math.PI;
   return alpha;
}
//----------------------------------------------------------------------------
function CalcEquation(A,B,C,D,E,F)
{
   // Find x & y values
   // Ax + By = C
   // Dx + Ey = F
   
   var xy = [0,0];
   
   var x = ((C*E) - (B*F)) / ((A*E) - (B*D));
   var y = ((A*F) - (C*D)) / ((A*E) - (B*D));
   
   xy[0] = x;
   xy[1] = y;
   
   return xy;
}
//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
// 2D functions
//--------------------------------------------------------------------------
function Draw2D_Line(ctx,x1,y1,x2,y2,color)
{
   ctx.save();
   if (1)
   {
      //ctx.strokeStyle = "blue";
      //if (color)
      ctx.strokeStyle = color;
      ctx.lineWidth = .5;
      //
      ctx.beginPath();
      ctx.moveTo(x1,y1);
      ctx.lineTo(x2,y2);
      //ctx.fill();
      ctx.stroke();
      ctx.closePath();
   }
   ctx.restore();
}
//----------------------------------------------------------------------------
function Draw2D_LineCustom(ctx,x1,y1,x2,y2,color_line, border_line_weight)
{
   ctx.save();
   if (1)
   {
      //ctx.strokeStyle = "blue";
      //if (color)
      ctx.strokeStyle = color_line;
      ctx.lineWidth = border_line_weight;
      //
      ctx.beginPath();
      ctx.moveTo(x1,y1);
      ctx.lineTo(x2,y2);
      //ctx.fill();
      ctx.stroke();
      ctx.closePath();
   }
   ctx.restore();
}
//----------------------------------------------------------------------------
function Draw2D_Point(ctx,x1,y1,x2,y2,color,border_weight)
{
   ctx.save();
   if (1)
   {
      //ctx.strokeStyle = "blue";
      //if (color)
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = border_weight;
      //
      ctx.beginPath();
      ctx.moveTo(x1,y1);
      ctx.lineTo(x2,y2);
      //ctx.fill();
      ctx.stroke();
      ctx.closePath();
   }
   ctx.restore();
}
//----------------------------------------------------------------------------
function Draw2D_Quadrangle(ctx, x1,y1, x2,y2, x3,y3, x4,y4 ,strokeColor, fillColor)
{
    // alert(x1 + " " + y1 + " " + x2 + " " + y2 + " " + x3 + " " + y3 + " " + x4 + " " + y4 + " ");
    ctx.save();
    if (1)
    { 
        ctx.strokeStyle = strokeColor;
				ctx.fillStyle = fillColor;
				ctx.globalAlpha = 0.5;
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.lineTo(x3,y3);
        ctx.lineTo(x4,y4);
        ctx.lineTo(x1,y1);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }
   ctx.restore();
}
//--------------------------------------------------------------------------
function Draw2D_Triangle(ctx,x1,y1,x2,y2,x3,y3, strokeColor, fillColor)
{
   ctx.save();
   if (1)
   {
      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x1,y1);
      ctx.lineTo(x2,y2);
      ctx.lineTo(x3,y3);
      ctx.lineTo(x1,y1);
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
   }
   ctx.restore();
}
//----------------------------------------------------------------------------
function Draw2D_DrawArrowPoint(ctx,x1,y1,h, direction, strokeColor, fillColor)
{
   //direction
   //up=0        
   //down=180
   //right=90
   //left=-90 or 270

   var x2,y2,x3,y3;
   
   var angle = 65;
   var a = h / Math.tan( angle * Math.PI / 180);
   //var a = h/2
   
   if (direction == 0) //up
   {
       x2 = x1 + a;
       y2 = y1 + h;
       x3 = x1 - a;
       y3 = y1 + h;      
   }
   else
   if (direction == 180) //down
   {
       x2 = x1 - a;
       y2 = y1 - h;
       x3 = x1 + a;
       y3 = y1 - h;      
   }
   else
   if (direction == 90) //right
   {
       x2 = x1 - h;
       y2 = y1 + a;
       x3 = x1 - h;
       y3 = y1 - a;      
   }
   else
   if (direction == -90 || direction == 270) //left
   {
       x2 = x1 + h;
       y2 = y1 - a;
       x3 = x1 + h;
       y3 = y1 + a;      
   }
   Draw2D_Triangle(ctx,x1,y1,x2,y2,x3,y3, strokeColor, fillColor);

}
//----------------------------------------------------------------------------
function Draw2D_GetShapePointsArray(cx,cy,r,sides)
{
   //var xy_arr = new Array(2*(sides+1)); //koko
   var xy_arr = new Array();
   var x1 = cx + r;
   var y1 = cy + r;
   var i,j;
   var step = 360; 

   if (sides > 0)
     step = step / sides;
   
   j = 0;
   xy_arr[j] = x1
   xy_arr[j+1] = y1;
   j += 2;   
   for (i=0; i < 360; i += step)
   {
      var angle = i*(Math.PI / 180); 
      var xy = Draw2D_RotatePoint(cx,cy,x1,y1,angle);
      var x2 = xy[0];
      var y2 = xy[1];
      xy_arr[j] = x2
      xy_arr[j+1] = y2;
      j += 2;
   }
   //last point should be the starting point x1,y1 to close the shape lines
   xy_arr[j] = x1
   xy_arr[j+1] = y1;
   //alert(xy_arr.length);
   return xy_arr;   
}
//----------------------------------------------------------------------------
function Draw2D_DrawShape(ctx,cx,cy,r,sides, strokeColor, fillColor)
{
   var x1 = cx;
   var y1 = cy - r;
   var i;
   var step = 360; 

   if (sides > 0)
     step = step / sides;
   
   ctx.save();   
   ctx.lineWidth = 1;
   
   ctx.strokeStyle = strokeColor;
   ctx.beginPath();
   ctx.moveTo(x1,y1);
   for (i=0; i < 360; i += step)
   {
      var angle = i*(Math.PI / 180); 
      var xy = Draw2D_RotatePoint(cx,cy,x1,y1,angle);
      var x2 = xy[0];
      var y2 = xy[1];
      ctx.lineTo(x2,y2);
   }
   ctx.lineTo(x1,y1);   
   ctx.fill();
   ctx.stroke();
   ctx.closePath();
   ctx.restore();
}
//----------------------------------------------------------------------------
function Draw2D_RotatePoint(cx,cy,x2,y2,angle)
{
    var x3y3 = [0,0];

    var rr = (y2-cy)*(y2-cy) + (x2-cx)*(x2-cx);
    var r = Math.sqrt(rr);
    
    var delta1 = Math.asin((x2-cx)/r);   // -90 <= delta <= 90
    //var delta2 = Math.acos((cy-y2)/r);  // -90 <= delta <= 90

    //alert("cy=" + cy + " yy2=" + yy2 + " delta1=" + 180*delta1/Math.PI);
    
    if (1) 
    {
        //fix delta1 angle
        if (x2 >= cx && y2 <= cy)
          delta1 += 0;
        else    
        if (x2 >= cx && y2 >= cy)
          delta1 = Math.PI - delta1;   
        else    
        if (x2 <= cx && y2 >= cy)
          delta1 += Math.PI;   
        //else    
        //if (xx2 <= cx && yy2 <= cy)
        //  delta1 += 3*Math.PI/2;   
    }

    //alert("cy=" + cy + " yy2=" + yy2 + " delta1=" + 180*delta1/Math.PI);

    var alpha = angle;
    var beta = (delta1 + alpha);
    //alert(180*beta/Math.PI);
    var x3 = cx + r*Math.sin(beta);
    var y3 = cy - r*Math.cos(beta);
    
    x3y3[0] = x3;
    x3y3[1] = y3;
    return x3y3;   
}
//--------------------------------------------------------------------------





















